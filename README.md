# 오늘 뭐 먹지? 강동역 맛집 랜덤 선택기 🎲

강동역 주변의 다양한 식당 정보를 확인하고, 간단한 투표를 통해 오늘의 메뉴를 랜덤으로 추천받을 수 있는 웹 애플리케이션입니다.

## ✨ 주요 기능

-   **🍽️ 식당 목록 조회**: 강동역 주변 94개 식당의 목록을 한눈에 볼 수 있습니다.
-   **🔎 상세 필터링 및 검색**:
    -   **식사 시간 필터**: 조식, 중식, 석식 가능 여부에 따라 식당을 필터링할 수 있습니다.
    -   **음식 종류 필터**: 한식, 일식, 카페/디저트 등 카테고리별로 식당을 볼 수 있습니다.
    -   **이름 검색**: 원하는 식당의 이름을 바로 검색할 수 있습니다.
-   **🗳️ 투표 시스템**:
    -   `+`, `-` 버튼으로 가고 싶은 식당에 투표하여 후보를 정할 수 있습니다.
    -   '투표한 곳만 표시' 체크박스를 통해 투표한 식당만 모아볼 수 있습니다.
-   **🎡 랜덤 룰렛**:
    -   투표한 식당들 중에서 랜덤으로 하나의 메뉴를 추천해줍니다.
    -   **가중치 적용**: 투표 수가 많을수록 추천될 확률이 높아집니다.
-   **🗺️ 지도 연동**: 각 식당의 '지도' 버튼 클릭 시 네이버 지도로 위치를 바로 확인할 수 있습니다.
-   **✍️ 방명록**:
    -   식당별로 간단한 후기를 남기고 볼 수 있는 방명록 기능이 있습니다.
    -   게시글은 비밀번호를 통해 수정 및 삭제가 가능합니다.

## 🛠️ 기술 스택

-   **Frontend**: HTML, CSS, JavaScript
-   **Libraries**:
    -   jQuery
    -   DataTables.js
-   **Backend & DB**:
    -   Supabase (방명록 데이터 관리)

## 🚀 사용 방법

1.  **필터 설정**: 원하는 식사 시간(조식/중식/석식)이나 음식 종류를 선택하여 식당 목록을 좁힙니다.
2.  **투표하기**: 마음에 드는 식당의 `+` 버튼을 눌러 투표합니다. 여러 번 투표하여 가중치를 높일 수 있습니다.
3.  **룰렛 돌리기**: 상단의 **"오늘 뭐 먹지? 룰렛 돌리기! 🎲"** 버튼을 클릭하여 오늘의 메뉴를 추천받습니다.
4.  **결과 확인**: 잠시 후 투표 결과를 바탕으로 랜덤 추천된 식당 이름이 표시됩니다.
5.  **정보 확인**: '지도' 버튼으로 위치를 확인하고, '방명록' 버튼으로 다른 사람들의 후기를 참고하세요!

## ⚙️ 로컬 환경에서 실행하기

이 프로젝트를 로컬 환경에서 실행하려면 다음과 같은 설정이 필요합니다.

1.  **저장소 복제(Clone)**
    ```bash
    git clone [https://github.com/your-username/your-repository.git](https://github.com/your-username/your-repository.git)
    cd your-repository
    ```
2.  **Supabase 설정**
    1.  [Supabase](https://supabase.com/)에 가입하고 새 프로젝트를 생성합니다.
    2.  **SQL Editor**에서 아래 쿼리를 실행하여 `guestbook` 테이블을 생성합니다.
        ```sql
        CREATE TABLE guestbook (
          id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          restaurant_id BIGINT,
          author TEXT,
          content TEXT,
          password TEXT
        );
        ```
    3.  생성된 `guestbook` 테이블의 **RLS(Row Level Security)**를 활성화합니다.
3.  **환경 변수 설정**
    1.  프로젝트 루트에 `.env` 파일을 생성합니다.
    2.  Supabase 프로젝트 대시보드의 **Project Settings > API**에서 발급받은 키를 `.env` 파일에 추가합니다.
        ```
        VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
        VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
        ```
    3. `.gitignore` 파일에 `.env`를 추가하여 키가 외부에 노출되지 않도록 합니다.
4.  **의존성 설치 및 실행**
    - 이 프로젝트는 Vite와 같은 빌드 도구를 사용하여 환경 변수를 관리하는 것을 권장합니다.
    ```bash
    # 의존성 설치
    npm install

    # 개발 서버 실행
    npm run dev
    ```