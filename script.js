// ⚠️ 여기에 Supabase 설정 가이드에서 발급받은 키를 입력하세요.
const SUPABASE_URL = 'https://lggosdjligtdcgnupiij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZ29zZGpsaWd0ZGNnbnVwaWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMjMwMjksImV4cCI6MjA3MDg5OTAyOX0.6Z1L0l-MRHyu1cuPOVeAVnUXU5tGvOzMGUGngvKc370';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

$(document).ready(function() {
    let table = $('#restaurantTable').DataTable({
        "pageLength": 100,
        "data": restaurantData,
        "columns": [
            { "data": null, "render": () => `<div class="vote-control"><span class="vote-count">0</span><div class="vote-buttons"><button class="vote-btn minus" aria-label="minus">-</button><button class="vote-btn plus" aria-label="plus">+</button></div></div>`, "orderable": false },
            { "data": "id" },
            { "data": "name", "className": "restaurant-name" },
            { "data": "breakfast", "className": "availability" },
            { "data": "lunch", "className": "availability" },
            { "data": "dinner", "className": "availability" },
            { "data": "category" },
            { "data": null, "render": (d) => `<button class="map-btn" onclick="window.open('https://map.naver.com/p/search/${encodeURIComponent(d.name)}', '_blank')">지도</button>`, "orderable": false },
            { "data": null, "render": (data) => `<button class="guestbook-btn" data-id="${data.id}" data-name="${data.name}">방명록</button>`, "orderable": false }
        ],
        "createdRow": function(row, data, dataIndex) {
            $(row).find('td').each(function(index) {
                if (["O", "X"].includes($(this).text())) {
                    const className = $(this).text() === 'O' ? 'available' : 'unavailable';
                    $(this).addClass(className);
                }
            });
        },
        "language": { "search": "가맹점 검색:", "lengthMenu": "_MENU_ 개씩 보기", "info": "총 _TOTAL_개 중 _START_에서 _END_까지 표시", "infoEmpty": "표시할 데이터가 없습니다.", "infoFiltered": "(_MAX_개에서 필터링됨)", "zeroRecords": "일치하는 데이터가 없습니다.", "paginate": { "first": "처음", "last": "마지막", "next": "다음", "previous": "이전" } },
        "order": [[1, 'asc']],
        "columnDefs": [ { "targets": [1, 3, 4, 5, 6], "className": "dt-body-center" } ],
        "dom": '<"top"lf>rt<"bottom"ip><"clear">'
    });

    $('input[name="meal_time"]').on('change', () => table.draw());
    $('#filter-category').on('change', function() { table.column(6).search(this.value).draw(); });
    $('#showVotedOnly').on('change', () => table.draw());

    $.fn.dataTable.ext.search.push(
        function(settings, data, dataIndex) {
            const mealFilter = $('input[name="meal_time"]:checked').val();
            const showVotedOnly = $('#showVotedOnly').is(':checked');
            let isMealAvailable = true;
            if (mealFilter === 'breakfast' && data[3] !== 'O') isMealAvailable = false;
            if (mealFilter === 'lunch' && data[4] !== 'O') isMealAvailable = false;
            if (mealFilter === 'dinner' && data[5] !== 'O') isMealAvailable = false;
            let isVoted = !showVotedOnly || parseInt($(table.row(dataIndex).node()).find('.vote-count').text()) > 0;
            return isMealAvailable && isVoted;
        }
    );
    
    $('#restaurantTable tbody').on('click', '.vote-btn', function() {
        const countSpan = $(this).closest('.vote-control').find('.vote-count');
        let currentVotes = parseInt(countSpan.text());
        if ($(this).hasClass('plus')) currentVotes++;
        else if ($(this).hasClass('minus') && currentVotes > 0) currentVotes--;
        countSpan.text(currentVotes);
        if ($('#showVotedOnly').is(':checked') && currentVotes === 0) table.row($(this).closest('tr')).draw();
    });

    $('#selectAllBtn').on('click', () => table.rows({ search: 'applied' }).nodes().to$().find('.vote-count').text('1'));
    $('#resetAllBtn').on('click', () => { table.rows().nodes().to$().find('.vote-count').text('0'); table.draw(); });

    $('#randomPickBtn').on('click', function() {
        let weightedList = [];
        table.rows({ search: 'applied' }).every(function () {
            const votes = parseInt($(this.node()).find('.vote-count').text());
            if (votes > 0) {
                for (let i = 0; i < votes; i++) weightedList.push(this.data().name);
            }
        });
        const resultDisplay = $('#resultDisplay');
        if (weightedList.length === 0) {
            resultDisplay.text("투표한 식당이 없어요! 먼저 투표해주세요. 🗳️");
            return;
        }
        const selected = weightedList[Math.floor(Math.random() * weightedList.length)];
        resultDisplay.html(`오늘의 메뉴는... 🥁 <br><strong>${selected}</strong> 입니다!`);
    });

    const modal = $('#guestbookModal');

    $('#restaurantTable tbody').on('click', '.guestbook-btn', async function() {
        const restaurantId = $(this).data('id');
        const restaurantName = $(this).data('name');
        
        $('#modalRestaurantName').text(restaurantName);
        $('#modalRestaurantId').val(restaurantId);
        
        await loadPosts(restaurantId);
        modal.show();
    });

    $('.close-btn').on('click', () => modal.hide());
    $(window).on('click', (event) => {
        if ($(event.target).is(modal)) modal.hide();
    });

    async function loadPosts(restaurantId) {
        const postsContainer = $('#postsContainer');
        postsContainer.html('로딩 중...');
        const { data, error } = await supabaseClient
            .from('guestbook')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false });

        if (error) {
            postsContainer.html('글을 불러오는데 실패했습니다.');
            console.error(error);
            return;
        }

        if (data.length === 0) {
            postsContainer.html('아직 작성된 글이 없습니다.');
            return;
        }

        postsContainer.empty();
        data.forEach(post => {
            const postDate = new Date(post.created_at).toLocaleString('ko-KR');
            const postElement = `
                <div class="post">
                    <div class="post-header">
                        <span class="post-author">${post.author}</span>
                        <span>${postDate}</span>
                    </div>
                    <p class="post-content">${post.content.replace(/\n/g, '<br>')}</p>
                    <div class="post-actions">
                        <button onclick="editPost(${post.id}, '${post.content}')">수정</button>
                        <button onclick="deletePost(${post.id})">삭제</button>
                    </div>
                </div>
            `;
            postsContainer.append(postElement);
        });
    }
    
    // [ 중요! ] : 방명록 제출 로직 변경
    $('#addPostForm').on('submit', async function(e) {
        e.preventDefault();
        const submitButton = $(this).find('button[type="submit"]');
        submitButton.prop('disabled', true).text('등록 중...');

        // 1. reCAPTCHA 응답 토큰 가져오기
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            alert('"로봇이 아닙니다"를 체크해주세요.');
            submitButton.prop('disabled', false).text('등록');
            return;
        }

        const restaurantId = $('#modalRestaurantId').val();
        const author = $('#postAuthor').val();
        const content = $('#postContent').val();
        const password = $('#postPassword').val();

        try {
            // 2. Supabase Edge Function 호출
            const { data, error } = await supabaseClient.functions.invoke('submit-guestbook', {
                body: {
                    recaptchaToken: recaptchaResponse,
                    postData: {
                        restaurant_id: restaurantId,
                        author,
                        content,
                        password
                    }
                }
            });

            if (error) throw error; // 네트워크 에러 등

            // Edge Function 내부에서 발생한 에러 처리
            if (data.error) {
                throw new Error(data.error);
            }
            
            // 3. 성공 처리
            $('#addPostForm')[0].reset();
            await loadPosts(restaurantId);

        } catch (error) {
            alert('글 등록에 실패했습니다: ' + error.message);
            console.error(error);
        } finally {
            grecaptcha.reset(); // reCAPTCHA 위젯 초기화
            submitButton.prop('disabled', false).text('등록');
        }
    });
});

async function editPost(postId, currentContent) {
    const password = prompt('수정하려면 비밀번호를 입력하세요:');
    if (!password) return;

    const { data, error: checkError } = await supabaseClient
        .from('guestbook')
        .select('id')
        .eq('id', postId)
        .eq('password', password)
        .single();

    if (checkError || !data) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    const newContent = prompt('수정할 내용을 입력하세요:', currentContent);
    if (!newContent) return;

    const { error: updateError } = await supabaseClient
        .from('guestbook')
        .update({ content: newContent })
        .eq('id', postId);

    if (updateError) {
        alert('수정에 실패했습니다.');
    } else {
        await $('#guestbookModal').trigger('reload');
    }
}

async function deletePost(postId) {
    const password = prompt('삭제하려면 비밀번호를 입력하세요:');
    if (!password) return;

    const { data, error: checkError } = await supabaseClient
        .from('guestbook')
        .select('id')
        .eq('id', postId)
        .eq('password', password)
        .single();
    
    if (checkError || !data) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    if (confirm('정말로 삭제하시겠습니까?')) {
        const { error: deleteError } = await supabaseClient
            .from('guestbook')
            .delete()
            .eq('id', postId);

        if (deleteError) {
            alert('삭제에 실패했습니다.');
        } else {
            await $('#guestbookModal').trigger('reload');
        }
    }
}

$('#guestbookModal').on('reload', async function() {
    const restaurantId = $('#modalRestaurantId').val();
    await loadPosts(restaurantId);
});