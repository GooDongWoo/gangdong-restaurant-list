# 오늘 뭐 먹지? 강동역 맛집 랜덤 선택기 🎲

> 강동역 주변의 다양한 식당 정보를 확인하고, 간단한 투표를 통해 오늘의 메뉴를 랜덤으로 추천받을 수 있는 웹 애플리케이션입니다.

## 📋 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#️-기술-스택)
- [사용 방법](#-사용-방법)
- [로컬 환경 설정](#️-로컬-환경-설정)
- [프로젝트 구조](#-프로젝트-구조)
- [기여하기](#-기여하기)
- [문제 해결](#-문제-해결)
- [라이선스](#-라이선스)

## ✨ 주요 기능

### 🍽️ 식당 관리
- **식당 목록 조회**: 강동역 주변 94개 식당의 전체 목록 제공
- **상세 정보**: 각 식당의 위치, 운영 시간, 음식 종류 등 상세 정보 확인

### 🔎 스마트 필터링
- **식사 시간 필터**: 조식, 중식, 석식 가능 여부에 따른 필터링
- **음식 종류 필터**: 한식, 일식, 중식, 양식, 카페/디저트 등 카테고리별 분류
- **실시간 검색**: 식당 이름으로 즉시 검색 가능

### 🗳️ 투표 시스템
- **간편 투표**: `+`, `-` 버튼으로 직관적인 투표
- **가중치 적용**: 여러 번 투표하여 선호도 조절 가능
- **투표 현황**: 투표한 식당만 별도로 모아보기 기능

### 🎡 랜덤 룰렛
- **가중 랜덤**: 투표 수에 비례한 확률로 식당 추천
- **즉시 결과**: 클릭 한 번으로 오늘의 메뉴 결정
- **재추천**: 만족할 때까지 다시 돌리기 가능

### 🗺️ 위치 서비스
- **지도 연동**: 네이버 지도로 식당 위치 바로 확인
- **원클릭 이동**: 지도 버튼 클릭으로 즉시 위치 정보 제공

### ✍️ 방명록 시스템
- **식당별 후기**: 각 식당마다 독립적인 방명록 운영
- **안전한 관리**: 비밀번호 기반의 수정/삭제 시스템
- **실시간 업데이트**: 새로운 후기 즉시 반영

## 🛠️ 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: 반응형 디자인 및 모던 스타일링
- **JavaScript (ES6+)**: 동적 기능 구현

### Libraries & Frameworks
- **jQuery**: DOM 조작 및 이벤트 처리
- **DataTables.js**: 테이블 데이터 관리 및 필터링

### Backend & Database
- **Supabase**: 
  - PostgreSQL 데이터베이스
  - 실시간 데이터 동기화
  - 서버리스 RPC 함수
  - Row Level Security (RLS)

## 🚀 사용 방법

### 1️⃣ 식당 탐색
1. 원하는 식사 시간(조식/중식/석식) 필터 선택
2. 음식 종류별 카테고리 필터 적용
3. 검색창에서 특정 식당 이름 검색

### 2️⃣ 투표 참여
1. 마음에 드는 식당의 `+` 버튼 클릭
2. 선호도에 따라 여러 번 투표 가능
3. `투표한 곳만 표시` 체크박스로 후보 확인

### 3️⃣ 랜덤 추천
1. 상단의 **"오늘 뭐 먹지? 룰렛 돌리기! 🎲"** 버튼 클릭
2. 가중치가 적용된 랜덤 알고리즘으로 식당 선택
3. 추천 결과 확인 및 재추천 가능

### 4️⃣ 정보 활용
1. `지도` 버튼으로 식당 위치 확인
2. `방명록` 버튼으로 다른 사용자 후기 참고
3. 직접 후기 작성 및 공유

## ⚙️ 로컬 환경 설정

### 📋 사전 요구사항
- Node.js 14.0 이상
- npm 또는 yarn
- Supabase 계정

### 1️⃣ 프로젝트 클론
```bash
git clone [저장소 주소]
cd kangdong-restaurant-selector
```

### 2️⃣ Supabase 설정

#### 프로젝트 생성
1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트 생성
2. 프로젝트 대시보드에서 **Project Settings > API** 확인

#### 데이터베이스 테이블 생성
SQL Editor에서 다음 쿼리 실행:

```sql
-- 방명록 테이블 생성
CREATE TABLE guestbook (
  query_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  restaurant_id BIGINT,
  author TEXT,
  content TEXT,
  password TEXT
);

-- RLS 활성화
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;
```

#### 보안 함수 생성
```sql
-- UPDATE 함수
CREATE OR REPLACE FUNCTION update_guestbook_post(post_id BIGINT, user_password TEXT, new_content TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_match BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.guestbook
    WHERE query_id = post_id AND password = user_password
  ) INTO is_match;

  IF is_match THEN
    UPDATE public.guestbook
    SET content = new_content
    WHERE query_id = post_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DELETE 함수
CREATE OR REPLACE FUNCTION delete_guestbook_post(post_id BIGINT, user_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_match BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.guestbook
    WHERE query_id = post_id AND password = user_password
  ) INTO is_match;

  IF is_match THEN
    DELETE FROM public.guestbook
    WHERE query_id = post_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 함수 권한 설정
```sql
-- 익명 사용자에게 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.update_guestbook_post(BIGINT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.delete_guestbook_post(BIGINT, TEXT) TO anon;
```

### 3️⃣ 환경 변수 설정
프로젝트 루트에 `.env` 파일 생성:

```env
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 4️⃣ 의존성 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 📁 프로젝트 구조

```
kangdong-restaurant-selector/
├── index.html              # 메인 HTML 페이지
├── styles.css              # 스타일시트
├── script.js               # 메인 JavaScript 로직
├── restaurants.json        # 식당 데이터
├── .env                    # 환경 변수 (git 제외)
├── .gitignore             # Git 제외 파일 목록
├── package.json           # 프로젝트 설정 및 의존성
└── README.md              # 프로젝트 문서
```

## 🤝 기여하기

### 기여 방법
1. 프로젝트 Fork
2. 새로운 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

### 개발 가이드라인
- 코드 스타일: ESLint 규칙 준수
- 커밋 메시지: [Conventional Commits](https://www.conventionalcommits.org/) 형식 사용
- 테스트: 새로운 기능에 대한 테스트 작성 권장

## 🔧 문제 해결

### 자주 발생하는 문제들

**Q: Supabase 연결이 되지 않아요**
- A: `.env` 파일의 URL과 API 키가 정확한지 확인하세요
- 브라우저 개발자 도구의 Console에서 에러 메시지를 확인하세요

**Q: 방명록 수정/삭제가 안 돼요**
- A: 데이터베이스 함수가 제대로 생성되었는지 확인하세요
- 함수 실행 권한이 `anon` 사용자에게 부여되었는지 확인하세요

**Q: 식당 데이터가 표시되지 않아요**
- A: `restaurants.json` 파일이 올바른 경로에 있는지 확인하세요
- 네트워크 탭에서 파일 로딩 상태를 확인하세요

### 지원 받기
- 이슈: [GitHub Issues](https://github.com/GooDongWoo/gangdong-restaurant-list) 페이지에서 버그 리포트 및 기능 요청
- 문의: [wendy1301@naver.com]

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.