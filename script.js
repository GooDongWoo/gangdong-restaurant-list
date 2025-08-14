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
            { "data": "name" },
            { "data": "breakfast", "className": "availability" },
            { "data": "lunch", "className": "availability" },
            { "data": "dinner", "className": "availability" },
            { "data": "category" },
            { "data": null, "render": (d) => `<button class="map-btn" onclick="window.open('https://map.naver.com/p/search/${encodeURIComponent(d.name)}', '_blank')">지도</button>`, "orderable": false }
        ],
        "createdRow": function(row, data, dataIndex) {
            const headers = ["투표", "순번", "가맹점", "조식", "중식", "석식", "음식점 종류", "지도"];
            $(row).find('td').each(function(index) { $(this).attr('data-label', headers[index]); });
            $(row).find('td:eq(3)').addClass(data.breakfast === 'O' ? 'available' : 'unavailable').text(data.breakfast);
            $(row).find('td:eq(4)').addClass(data.lunch === 'O' ? 'available' : 'unavailable').text(data.lunch);
            $(row).find('td:eq(5)').addClass(data.dinner === 'O' ? 'available' : 'unavailable').text(data.dinner);
        },
        "language": {
            "search": "가맹점 검색:", "lengthMenu": "_MENU_ 개씩 보기", "info": "총 _TOTAL_개", "infoEmpty": "표시할 데이터가 없습니다.", "infoFiltered": "(_MAX_개 항목에서 필터링)", "zeroRecords": "일치하는 데이터가 없습니다.", "paginate": { "previous": "이전", "next": "다음" }
        },
        "ordering": false, "info": false, "lengthChange": false
    });

    // --- 커스텀 필터 로직 ('투표한 식당만 보기' 추가) ---
    $.fn.dataTable.ext.search.push(
        function(settings, data, dataIndex) {
            if (settings.nTable.id !== 'restaurantTable') return true;

            const rowData = settings.aoData[dataIndex]._aData;
            const meal_filter = $('input[name="meal_time"]:checked').val();
            const category_filter = $('#filter-category').val();
            const show_voted = $('#showVotedOnly').is(':checked');

            // 투표수 가져오기
            const tr = settings.aoData[dataIndex].nTr; // 현재 행의 DOM element
            const votes = parseInt($(tr).find('.vote-count').text());

            // '투표한 식당만 보기' 필터 조건
            let voted_match = !show_voted || (show_voted && votes > 0);
            if (!voted_match) return false;

            // 기존 식사, 종류 필터 조건
            let meal_match = true;
            if (meal_filter === 'breakfast') meal_match = rowData.breakfast === 'O';
            else if (meal_filter === 'lunch') meal_match = rowData.lunch === 'O';
            else if (meal_filter === 'dinner') meal_match = rowData.dinner === 'O';
            
            let category_match = category_filter ? (rowData.category === category_filter) : true;
            
            return meal_match && category_match;
        }
    );

    // 필터 변경 시 테이블 다시 그리기
    $('input[name="meal_time"], #filter-category, #showVotedOnly').on('change', function() {
        table.draw();
    });

    // --- 신규 +/- 버튼 이벤트 처리 (이벤트 위임 방식) ---
    $('#restaurantTable tbody').on('click', '.vote-btn', function() {
        const $voteCount = $(this).siblings('.vote-count');
        let currentVotes = parseInt($voteCount.text());

        if ($(this).hasClass('plus')) {
            currentVotes++;
        } else if ($(this).hasClass('minus')) {
            currentVotes = Math.max(0, currentVotes - 1); // 0 미만으로 내려가지 않음
        }
        
        $voteCount.text(currentVotes);

        // '투표한 식당만 보기'가 활성화된 상태에서 투표수를 0으로 만들면 바로 목록에서 사라지도록 함
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

        table.rows().every(function () {
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
            resultDisplay.text('먼저 1표 이상 투표해주세요!').css('color', '#ff5722');
            return;
        }

        const randomIndex = Math.floor(Math.random() * weightedList.length);
        const winner = weightedList[randomIndex];
        
        resultDisplay.html(`🎉 오늘의 식당은 바로... <strong>${winner}</strong> 입니다! 🎉`).css('color', '#1c3b69');
    });
});