const videoTag = document.getElementById('video');
const searchInput = document.getElementById('searchInput');
const tagNav = document.getElementById('tagNav');
const tagNavForward = document.getElementById('tagNavScrollForward');
const tagNavBackward = document.getElementById('tagNavScrollBackward');
//전체 비디오 객체 리스트
let allVideoList = [];
//현재 비디오 객체 리스트 (검색 기능 등으로 필터링 된 목록)
let currentVideoList = [];
//현재 비디오의 태그 리스트
let currentTags = [];

//전체 비디오 리스트 초기화 및 비디오카드 생성
fetch("http://oreumi.appspot.com/video/getVideoList")
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        allVideoList = data;
        currentVideoList = data;
        setVideoCards(currentVideoList);
        setTagNavigator(getTags(currentVideoList));
    });

//비디오 카드 생성 함수
function setVideoCards(videoList) {
    //비디오카드가 추가될 html 요소
    const videos = document.getElementById("videos");
    //자식 요소 초기화
    videos.replaceChildren();

    for (let i = 0; i < videoList.length; i++) {
        //비디오카드 생성을 위한 html 요소
        const videoLink = document.createElement("a");
        const videoCard = document.createElement("div");
        const thumbnail = document.createElement("img");
        const detail = document.createElement("div");
        const channelProfileLink = document.createElement("a");
        const channelProfile = document.createElement("img");
        const infoText = document.createElement("div");
        const title = document.createElement("div");
        const channelName = document.createElement("a");
        const viewsAndUploaded = document.createElement("div");

        //각 태그들의 속성값 설정
        thumbnail.width = "300";

        infoText.appendChild(title);
        infoText.appendChild(channelName);
        infoText.appendChild(viewsAndUploaded);

        channelProfileLink.appendChild(channelProfile);

        detail.appendChild(channelProfileLink);
        detail.appendChild(infoText);

        videoCard.appendChild(thumbnail);
        videoCard.appendChild(detail);

        videoLink.appendChild(videoCard);

        videos.appendChild(videoLink);

        videoLink.href = `./Video.html?video_id=${videoList[i].video_id}`
        videoLink.className = "videoCard";
        thumbnail.className = "thumbnail";
        detail.className = "detail";
        channelProfile.className = "channelProfile userAvatar";
        infoText.className = "infoText";
        title.className = "title";
        channelName.className = "channelName";
        viewsAndUploaded.className = "viewsAndUploaded";

        //비디오 정보 받아오기
        fetch(`http://oreumi.appspot.com/video/getVideoInfo?video_id=${videoList[i].video_id}`)
            .then((response) => response.json())
            .then((data) => {
                thumbnail.src = data.image_link;
                title.innerText = data.video_title;
                viewsAndUploaded.innerText = `${data.views}Views, ${daysAgo(data.upload_date)}`;
                const dataVideoChannel = data.video_channel;
                channelName.innerText = dataVideoChannel;
                channelName.href = `./Channel.html?channel_name=${dataVideoChannel}`;
                channelProfileLink.href = `./Channel.html?channel_name=${dataVideoChannel}`;

                return fetch(`http://oreumi.appspot.com/channel/getChannelInfo?video_channel=${dataVideoChannel}`, { method: "POST" });
            })
            .then((response) => response.json())
            .then((data) => {
                channelProfile.src = data.channel_profile;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

//nav 태그 내부의 버튼 생성 함수
function setTagNavigator(tagList) {
    //버튼이 추가될 html 요소
    const tagNav = document.getElementById("tagNav");
    //자식 요소 초기화
    tagNav.replaceChildren();

    //전체보기 버튼 추가
    const tagButton = document.createElement("button");
    tagButton.innerText = "all";
    tagButton.id = "all";
    tagButton.className = "tagBtn selected";
    tagButton.addEventListener('click', onclickTagButton);
    tagNav.appendChild(tagButton);

    for (let i = 0; i < tagList.length; i++) {
        const tagButton = document.createElement("button");
        tagButton.innerText = tagList[i];
        tagButton.id = tagList[i];
        tagButton.className = "tagBtn";
        tagButton.addEventListener('click', onclickTagButton);
        tagNav.appendChild(tagButton);
    }
}

//검색 함수
function search() {
    let searchText = searchInput.value;
    let searchedList = [];
    for (let i = 0; i < allVideoList.length; i++) {
        if (allVideoList[i].video_channel.includes(searchText)
            || allVideoList[i].video_detail.includes(searchText)
            || allVideoList[i].video_title.includes(searchText)
            || allVideoList[i].video_tag.includes(searchText)
        ) {
            searchedList.push(allVideoList[i]);
        }
    }
    currentVideoList = searchedList;
    setVideoCards(searchedList);
    setTagNavigator(getTags(currentVideoList));
}

//검색창 엔터 이벤트 리스너
function searchEnter(event) {
    if (event.key === 'Enter') {
        search();
    }
}

//업로드 날짜 포맷 함수
function daysAgo(uploadedTime) {
    const uploaded = new Date(uploadedTime);
    const now = new Date();

    const timeToSecond = {
        YEAR: 31356000,
        MONTH: 2592000,
        WEEK: 604800,
        DAY: 86400,
        HOUR: 3600,
        MINUTE: 60,
    }

    const timeDiff = (now.getTime() - uploaded.getTime()) / 1000;
    if (timeDiff >= timeToSecond.YEAR) {
        return `${Math.floor(timeDiff / timeToSecond.YEAR)}년 전`
    }
    else if (timeDiff >= timeToSecond.MONTH) {
        return `${Math.floor(timeDiff / timeToSecond.MONTH)}달 전`
    }
    else if (timeDiff >= timeToSecond.WEEK) {
        return `${Math.floor(timeDiff / timeToSecond.WEEK)}주 전`
    }
    else if (timeDiff >= timeToSecond.DAY) {
        return `${Math.floor(timeDiff / timeToSecond.DAY)}일 전`
    }
    else if (timeDiff >= timeToSecond.HOUR) {
        return `${Math.floor(timeDiff / timeToSecond.HOUR)}시간 전`
    }
    else if (timeDiff >= timeToSecond.MINUTE) {
        return `${Math.floor(timeDiff / timeToSecond.MINUTE)}분 전`
    }
    else {
        return `${Math.floor(timeDiff)}초 전`
    }
}

//현재 검색결과의 tag 배열 반환 함수
function getTags(videoList) {
    currentTags = [];
    for (let i = 0; i < videoList.length; i++) {
        for (let j = 0; j < videoList[i].video_tag.length; j++) {
            currentTags.push(videoList[i].video_tag[j]);
        }
    }
    const deleteDup = new Set(currentTags);
    currentTags = [...deleteDup];
    return currentTags;
}

//navigator 버튼 이벤트 함수
function onclickTagButton(event) {
    //이전에 선택된 버튼 비활성화 / 현재 버튼 활성화
    const before = document.querySelector('.tagBtn.selected');
    before.classList.remove('selected');
    event.target.className = "tagBtn selected";

    //선택된 버튼이 all 버튼이면 전체 비디오 표시
    if (event.target.id === "all") {
        setVideoCards(currentVideoList);
        return;
    }

    //태그를 포함한 비디오를 필터링
    let videoList = [];
    const tag = event.target.id;
    for (let i = 0; i < currentVideoList.length; i++) {
        if (currentVideoList[i].video_tag.includes(tag)) {
            videoList.push(currentVideoList[i]);
        }
    }
    setVideoCards(videoList);
}

//tagNav 앞으로가기 버튼
function onclickTagNavForward() {
    const tagNavWidth = tagNav.clientWidth;
    const tagNavScrollWidth = tagNav.scrollWidth;
    const tagNavCurrentScroll = tagNav.scrollLeft;

    if (tagNavCurrentScroll - tagNavWidth <= 0) {
        tagNav.scrollLeft = 0;
        tagNavForward.classList.add("display_none");
        tagNavBackward.classList.remove("display_none");
    }
    else {
        tagNavBackward.classList.remove("display_none");
        tagNav.scrollLeft = tagNavCurrentScroll - tagNavWidth;
    }
}

//tagNav 뒤로가기 버튼
function onclickTagNavBackward() {
    const tagNavWidth = tagNav.clientWidth;
    const tagNavScrollWidth = tagNav.scrollWidth;
    const tagNavCurrentScroll = tagNav.scrollLeft;

    if (tagNavCurrentScroll + tagNavWidth >= tagNavScrollWidth - tagNavWidth) {
        tagNav.scrollLeft = tagNavScrollWidth - tagNavWidth;
        tagNavBackward.classList.add("display_none");
        tagNavForward.classList.remove("display_none");
    }
    else {
        tagNavForward.classList.remove("display_none");
        tagNav.scrollLeft = tagNavCurrentScroll + tagNavWidth;
    }
}