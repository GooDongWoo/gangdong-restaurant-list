$(document).ready(function() {
    let table = $('#restaurantTable').DataTable({
        "pageLength": 100,
        "data": restaurantData,
        "columns": [
            { "data": null, "defaultContent": '<input type="checkbox" class="row-selector">', "orderable": false },
            { "data": "id" },
            { "data": "name" },
            { "data": "breakfast", "className": "availability" },
            { "data": "lunch", "className": "availability" },
            { "data": "dinner", "className": "availability" },
            { "data": "category" },
            { "data": null, "render": (d) => `<button class="map-btn" onclick="window.open('https://map.naver.com/p/search/${encodeURIComponent(d.name)}', '_blank')">지도</button>`, "orderable": false }
        ],
        "createdRow": function(row, data, dataIndex) {
            // Add data-label attributes to every cell for CSS targeting
            const headers = ["선택", "순번", "가맹점", "조식", "중식", "석식", "음식점 종류", "지도"];
            $(row).find('td').each(function(index) {
                $(this).attr('data-label', headers[index]);
            });

            // Add styling classes for meal availability
            $(row).find('td:eq(3)').addClass(data.breakfast === 'O' ? 'available' : 'unavailable').text(data.breakfast);
            $(row).find('td:eq(4)').addClass(data.lunch === 'O' ? 'available' : 'unavailable').text(data.lunch);
            $(row).find('td:eq(5)').addClass(data.dinner === 'O' ? 'available' : 'unavailable').text(data.dinner);
        },
        "language": {
            "search": "가맹점 검색:", "lengthMenu": "_MENU_ 개씩 보기", "info": "총 _TOTAL_개", "infoEmpty": "표시할 데이터가 없습니다.", "infoFiltered": "(_MAX_개 항목에서 필터링)", "zeroRecords": "일치하는 데이터가 없습니다.", "paginate": { "previous": "이전", "next": "다음" }
        },
        "ordering": false, "info": false, "lengthChange": false
    });

    // Custom filtering logic (Robust version using original data object)
    $.fn.dataTable.ext.search.push(
        function(settings, data, dataIndex) {
            if (settings.nTable.id !== 'restaurantTable') {
                return true;
            }
            const rowData = settings.aoData[dataIndex]._aData; // Get original data object for the row
            const meal_filter = $('input[name="meal_time"]:checked').val();
            const category_filter = $('#filter-category').val();
            
            const breakfast_available = rowData.breakfast === 'O';
            const lunch_available = rowData.lunch === 'O';
            const dinner_available = rowData.dinner === 'O';
            const row_category = rowData.category;

            let meal_match = true;
            if (meal_filter === 'breakfast') meal_match = breakfast_available;
            else if (meal_filter === 'lunch') meal_match = lunch_available;
            else if (meal_filter === 'dinner') meal_match = dinner_available;
            
            let category_match = category_filter ? (row_category === category_filter) : true;
            
            return meal_match && category_match;
        }
    );

    // Redraw table when filters change
    $('input[name="meal_time"], #filter-category').on('change', function() {
        table.draw();
    });

    // Random pick button logic
    $('#randomPickBtn').on('click', function() {
        let selectedRestaurants = [];
        // Find all checked checkboxes within the table
        table.rows({ search: 'applied' }).nodes().to$().find('.row-selector:checked').each(function() {
            let rowData = table.row($(this).closest('tr')).data();
            selectedRestaurants.push(rowData.name);
        });

        const resultDisplay = $('#resultDisplay');
        if (selectedRestaurants.length === 0) {
            resultDisplay.text('먼저 식당을 1개 이상 선택해주세요!').css('color', '#dc3545');
            return;
        }

        const randomIndex = Math.floor(Math.random() * selectedRestaurants.length);
        const winner = selectedRestaurants[randomIndex];
        
        resultDisplay.html(`🎉 오늘의 식당은 바로... <strong>${winner}</strong> 입니다! 🎉`).css('color', '#007bff');
    });
});