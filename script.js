$(document).ready(function() {
    let table = $('#restaurantTable').DataTable({
        "pageLength": 100,
        "data": restaurantData,
        "columns": [
            // 신규 +/- 버튼 투표 UI 렌더링
            { 
                "data": null, 
                "render": () => `
                    <div class="vote-control">
                        <button class="vote-btn minus" aria-label="minus">-</button>
                        <span class="vote-count">0</span>
                        <button class="vote-btn plus" aria-label="plus">+</button>
                    </div>`,
                "orderable": false 
            },
            { "data": "id" },
            // "가맹점" 컬럼에 'restaurant-name' 클래스 추가
            { "data": "name", "className": "restaurant-name" },
            { "data": "breakfast", "className": "availability" },
            { "data": "lunch", "className": "availability" },
            { "data": "dinner", "className": "availability" },
            { "data": "category" },
            { "data": null, "render": (d) => `<button class="map-btn" onclick="window.open('https://map.naver.com/p/search/${encodeURIComponent(d.name)}', '_blank')">지도</button>`, "orderable": false }
        ],
        "createdRow": function(row, data, dataIndex) {
            const headers = ["투표", "순번", "가맹점", "조식", "중식", "석식", "음식점 종류", "지도"];
            $(row).find('td').each(function(index) {
                $(this).attr('data-label', headers[index]);
                
                // O/X 텍스트에 클래스 추가
                if (["O", "X"].includes($(this).text())) {
                    const className = $(this).text() === 'O' ? 'available' : 'unavailable';
                    $(this).addClass(className);
                }
            });
        },
        "language": {
            "search": "가맹점 검색:",
            "lengthMenu": "_MENU_ 개씩 보기",
            "info": "총 _TOTAL_개 중 _START_에서 _END_까지 표시",
            "infoEmpty": "표시할 데이터가 없습니다.",
            "infoFiltered": "(_MAX_개에서 필터링됨)",
            "zeroRecords": "일치하는 데이터가 없습니다.",
            "paginate": {
                "first": "처음",
                "last": "마지막",
                "next": "다음",
                "previous": "이전"
            }
        },
        "order": [[1, 'asc']],
        "columnDefs": [
            { "targets": [1, 3, 4, 5, 6], "className": "dt-body-center" }
        ],
        "dom": '<"top"lf>rt<"bottom"ip><"clear">'
    });

    // 식사 시간 필터링
    $('input[name="meal_time"]').on('change', function() {
        table.draw();
    });

    // 음식 종류 필터링
    $('#filterCategory').on('change', function() {
        table.column(6).search(this.value).draw();
    });
    
    // 투표한 식당만 보기 필터링
    $('#showVotedOnly').on('change', function() {
        table.draw();
    });

    $.fn.dataTable.ext.search.push(
        function( settings, data, dataIndex ) {
            const mealFilter = $('input[name="meal_time"]:checked').val();
            const showVotedOnly = $('#showVotedOnly').is(':checked');
            
            let isMealAvailable = true;
            if (mealFilter === 'breakfast' && data[3] !== 'O') isMealAvailable = false;
            if (mealFilter === 'lunch' && data[4] !== 'O') isMealAvailable = false;
            if (mealFilter === 'dinner' && data[5] !== 'O') isMealAvailable = false;

            let isVoted = true;
            if (showVotedOnly) {
                const votes = parseInt($(table.row(dataIndex).node()).find('.vote-count').text());
                if (isNaN(votes) || votes === 0) {
                    isVoted = false;
                }
            }
            
            return isMealAvailable && isVoted;
        }
    );
    
    // 투표 버튼 로직
    $('#restaurantTable tbody').on('click', '.vote-btn', function() {
        const countSpan = $(this).siblings('.vote-count');
        let currentVotes = parseInt(countSpan.text());

        if ($(this).hasClass('plus')) {
            currentVotes++;
        } else if ($(this).hasClass('minus') && currentVotes > 0) {
            currentVotes--;
        }
        
        countSpan.text(currentVotes);

        // '투표한 식당만 보기' 필터가 활성화된 경우, 투표 수가 0이 되면 행을 다시 그려서 숨김 처리
        if ($('#showVotedOnly').is(':checked') && currentVotes === 0) {
            table.row($(this).closest('tr')).draw();
        }
    });

    // 현재 목록 전체 선택 (투표 UI 변경에 따라 수정)
    $('#selectAllBtn').on('click', function() {
        table.rows({ search: 'applied' }).nodes().to$().find('.vote-count').text('1');
    });

    // 모든 투표 초기화 (투표 UI 변경에 따라 수정)
    $('#resetAllBtn').on('click', function() {
        table.rows().nodes().to$().find('.vote-count').text('0');
        table.draw(); // '투표한 식당만 보기' 필터가 활성화 되어있을 경우를 대비해 테이블을 다시 그림
    });

    // 가중치 기반 랜덤 선택 로직 (투표 UI 변경에 따라 수정)
    $('#randomPickBtn').on('click', function() {
        let weightedList = [];

        table.rows({ search: 'applied' }).every(function () { // 현재 필터링된 목록만 대상으로 변경
            const rowNode = this.node();
            const rowData = this.data();
            const votes = parseInt($(rowNode).find('.vote-count').text());

            if (!isNaN(votes) && votes > 0) {
                for (let i = 0; i < votes; i++) {
                    weightedList.push(rowData.name);
                }
            }
        });

        const resultDisplay = $('#resultDisplay');
        if (weightedList.length === 0) {
            resultDisplay.text("투표한 식당이 없어요! 먼저 투표해주세요. 🗳️");
            return;
        }

        const randomIndex = Math.floor(Math.random() * weightedList.length);
        const selectedRestaurant = weightedList[randomIndex];

        resultDisplay.html(`오늘의 메뉴는... 🥁 <br><strong>${selectedRestaurant}</strong> 입니다!`);
    });
});