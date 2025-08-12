$(document).ready(function() {
    let table = $('#restaurantTable').DataTable({
        "pageLength": 100,
        "data": restaurantData,
        "columns": [
            { "data": "id" },
            { "data": "name" },
            { "data": "breakfast", "className": "availability" },
            { "data": "lunch", "className": "availability" },
            { "data": "dinner", "className": "availability" },
            { "data": "category" },
            { "data": null, "render": (d) => `<button class="map-btn" onclick="window.open('https://map.naver.com/p/search/${encodeURIComponent(d.name)}', '_blank')">지도</button>` }
        ],
        "createdRow": function(row, data, dataIndex) {
            // Add data-label attributes to every cell for CSS targeting
            const headers = ["순번", "가맹점", "조식", "중식", "석식", "음식점 종류", "지도"];
            $(row).find('td').each(function(index) {
                $(this).attr('data-label', headers[index]);
            });

            // Add styling classes for meal availability
            $(row).find('td:eq(2)').addClass(data.breakfast === 'O' ? 'available' : 'unavailable').text(data.breakfast);
            $(row).find('td:eq(3)').addClass(data.lunch === 'O' ? 'available' : 'unavailable').text(data.lunch);
            $(row).find('td:eq(4)').addClass(data.dinner === 'O' ? 'available' : 'unavailable').text(data.dinner);
        },
        "language": {
            "search": "가맹점 검색:", "lengthMenu": "_MENU_ 개씩 보기", "info": "총 _TOTAL_개", "infoEmpty": "표시할 데이터가 없습니다.", "infoFiltered": "(_MAX_개 항목에서 필터링)", "zeroRecords": "일치하는 데이터가 없습니다.", "paginate": { "previous": "이전", "next": "다음" }
        },
        "ordering": false, "info": false, "lengthChange": false
    });

    // Custom filtering logic
    $.fn.dataTable.ext.search.push(
        function(settings, data, dataIndex) {
            const meal_filter = $('input[name="meal_time"]:checked').val();
            const category_filter = $('#filter-category').val();
            
            // data array: [id, name, breakfast, lunch, dinner, category, map_button_html]
            const breakfast_available = data[2] === 'O';
            const lunch_available = data[3] === 'O';
            const dinner_available = data[4] === 'O';
            const row_category = data[5];

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
});