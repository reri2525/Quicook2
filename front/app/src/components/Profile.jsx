import React, { useState, useEffect, Fragment } from 'react';
import '../ScssFile/Profile.scss'
import axios from 'axios';
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import FollowingIndex from './FollowingIndex';
import FollowersIndex from './FollowersIndex';
import { url } from "../config";
function Profile(props) {
  const loggedInStatus = props.loggedInStatus
  const relationshipCreate = props.relationshipCreate
  const relationshipDestroy = props.relationshipDestroy
  const setPromptingAccountCreation = props.setPromptingAccountCreation
  const [user, setUser] = useState([])
  const [relationship, setRelationship] = useState([])
  const [follow, setFollow] = useState([])
  const [follower, setFollower] = useState([])
  const [postsCount, setPostsCount] = useState([])
  const [followingIndexModal, setFollowingIndexModal] = useState(false)
  const [followersIndexModal, setFollowersIndexModal] = useState(false)
  const { id } = useParams();
  const { number } = useParams();
  const numericNumber = parseInt(number);
  const history = useHistory();
  const [postall, setPostall] = useState([])
  const [pagecount, setPagecount] = useState()
  const [currentPage, setCurrentPage] = useState(numericNumber)
  const page = [...Array(pagecount).keys()].map((i) => i + 1);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [heartedPosts, setHeartedPosts] = useState([]);
  const [postExist, setPostExist] = useState(true)

  useEffect(() => {
    setPostall([])
    openPlofile(id)
  }, [id])

  useEffect(() => {
    setPostall([])
    postAllGet(id)
  }, [number, id])

  const openPlofile = (id) => {
    axios.get(`${url}/users/${id}`, { withCredentials: true })
    .then(response => {
        const data = response.data
        setUser(data.user)
        setFollow(data.followed_count)
        setFollower(data.follower_count)
        setRelationship(data.relationship)
        setPostsCount(data.posts_count)
        console.log()
    })
    .catch(error => console.log("ユーザーいない"))
  }

  const handleRelationship = (id) => {
    if (relationship) {
     setRelationship(false)
     setFollower(follower - 1)
     relationshipDestroy(id)
    } else {
     if (loggedInStatus === "ログインなう") {
       setRelationship(true)
       setFollower(follower + 1)
     }
     relationshipCreate(id)
    }
  }

  const postShow = (id) => {
    history.push(`/posts/${id}`)
  }

  const postAllGet = (id) =>{
     axios.get(`${url}/user/${id}/posts`, { params: { page: currentPage }, withCredentials: true })
    .then(response => {
      if (response.data.status) {
        const data = response.data.post_all
        setPostall(data)
        setPagecount(response.data.total_pages)
        console.log("投稿取得成功")
        for (let i = 0; i < data.length; i++) {
          bookmarkExist(data[i]);
        }
        for (let i = 0; i < data.length; i++) {
          heartExist(data[i]);
        }
        setPostExist(true)
      } else {
        setPostExist(false)
        setPagecount(0)
        setCurrentPage(1)
        console.log("投稿なし")
      }
    })
    .catch(error => {
      console.log("投稿取得エラー", error)
    })
  }
  const postAdd = (page) => {
    setCurrentPage(page)
    history.push(`/profile/${id}/page/${page}`)
    window.scrollTo(0, 0);
  }
  const postBack = (currentPage) => {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1)
      history.push(`/profile/${id}/page/${currentPage - 1}`)
      }
    window.scrollTo(0, 0);
  }
  const postGo = (currentPage) => {
    if (currentPage !== pagecount) {
      setCurrentPage(currentPage + 1)
      history.push(`/profile/${id}/page/${currentPage + 1}`)
    }
    window.scrollTo(0, 0);
  }
  const handleBookmark = (post) => {
    if  (bookmarkedPosts.includes(post.id)) {
     props.bookmarkDestroy(post)
     setBookmarkedPosts(bookmarkedPosts.filter(id => id !== post.id));
    } else {
     props.bookmarkCreate(post)
     if (loggedInStatus === "ログインなう") {
      setBookmarkedPosts([...bookmarkedPosts, post.id]);
     }
    }
   }
  const bookmarkExist = (post) => {
    setBookmarkedPosts((prevBookmarkedPosts) => {
      if (post.bookmarks && post.bookmarks[0]) {
        return [...prevBookmarkedPosts, post.id];
      } else {
        return prevBookmarkedPosts.filter(id => id !== post.id);
      }
    });
  }
  const handleHeart = (post) => {
    if  (heartedPosts.includes(post.id)) {
     props.heartDestroy(post)
     setHeartedPosts(heartedPosts.filter(id => id !== post.id));
     post.heart_count = post.heart_count - 1
    } else {
     props.heartCreate(post)
     if (loggedInStatus === "ログインなう") {
      setHeartedPosts([...heartedPosts, post.id]);
      post.heart_count = post.heart_count + 1
     }
    }
  }
  const heartExist = (post) => {
    setHeartedPosts((prevHeartedPosts) => {
      if (post.hearts && post.hearts[0]) {
        return [...prevHeartedPosts, post.id];
      } else {
        return prevHeartedPosts.filter(id => id !== post.id);
      }
    });
  }
  const handleMouseEnter = (event) => {
    event.target.play();
    event.target.controls = true;
  };

  const handleMouseLeave = (event) => {
    event.target.pause();
    event.target.currentTime = 0;
    event.target.controls = false;
  };
  if (user.name) {
  return (
   <Fragment>
    <div className='profile_container'>
      <div className='icon'>
       <img className='image'
         src={user.avatar.url}>
       </img>
      </div>
      <div className='explanation'>
        <a className='user_name'>{user.name}</a>
        { user.id === props.user.id ? 
          <Link to="/edit" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <a className='edit_profile'>プロフィール編集</a>
          </Link> 
            : 
          relationship ?
              <a className="unfollow" onClick={() => handleRelationship(user.id)}>フォロー中</a>
                :
              <a className="follow" onClick={() => handleRelationship(user.id)}>フォローする</a>
        }
        <div className='user_data'>
         <a>投稿  {postsCount ? postsCount : 0 } 件</a>
         <a className='follow_modal' onClick={() => setFollowingIndexModal(true)}>フォロー {follow ? follow : 0 } 人</a>
         <a className='follow_modal' onClick={() => setFollowersIndexModal(true)}>フォロワー {follower ? follower : 0 } 人</a>
         <pre>{user.introduction}</pre>
        </div>
      </div>
    </div>
    { postExist ? 
         <></> 
           : 
         <Fragment>
           <div className='post_not_exist'>
             <h1>おっとこのユーザーにはコンテンツがありません...</h1>
             <HighlightOffIcon className='highlight_off_icon' style={{fontSize: '60px'}}/>
           </div>
         </Fragment>
    } 
    { postall[0] ? 
      <div className='post_container_profile'>
       {postExist ? <></> : <h1>誰も投稿してないの！？まじ？</h1>} 
       {postall.map((value, key) => {
         return (
         <div className='post' key={key} onClick={() => postShow(postall[key].id)}>
           <div className='head'>
             <div className='icon'>
             <img src={value.user.avatar.url}></img>
             </div>
               <Link to={`/profile/${value.user.id}/page/1`}
                  onClick={(e) => {e.stopPropagation();} }>
                     {value.user.name}
               </Link>
               <div className='bookmark' onClick={(e) => {e.stopPropagation(); handleBookmark(value); } }>
                    {bookmarkedPosts.includes(value.id) ? <BookmarkIcon/> : <BookmarkBorderIcon/>}
               </div>
           </div>
           <div className='middle'>
              { value.file_type === "image" ? <img src={value.thumbnail.url}></img> : <></> }
              { value.file_type === "video" ? 
                  <Fragment>
                    <img src={value.thumbnail.url}></img>
                    <PlayCircleOutlineIcon className='play_icon' style={{fontSize: '50px', color: 'white', fontWeight: '200'}}/> 
                  </Fragment>
                     : 
                  <></> 
              }
           </div>
           <div className='foot'>
             <a>{value.title}</a>
             <div className='favorite' onClick={(e) => {e.stopPropagation(); handleHeart(value); }}>
                  {heartedPosts.includes(value.id) ? <FavoriteIcon style={{ color: 'red' }}/> : <FavoriteBorder/>}
             </div>
             <a className='heart_count'>{value.heart_count}</a>
           </div>
         </div>
         )
       })}
      </div>
      : <></> }
      { postall.length === 0 && postExist ? 
               <div className='post_skeleton_container_profile'>
                 {[...Array(20).keys()].map(i =>
                    <div className='post_skeleton'></div>
                 )}
               </div> :
      <div className='pagenate_container'>
       {pagecount > 1 ? 
       <div className='pagenate'><nav className='back'>back</nav>
        <button className='page_move' onClick={() => postBack(currentPage)}><NavigateBeforeIcon/></button>
        { currentPage === 1 ? "" :
         <button 
           className={1 === currentPage ? 'active' : ''}
           onClick={() => postAdd(1)}>
              1
          </button>}
        {pagecount > 6 && currentPage > pagecount - 6 ? 
        page.slice(pagecount - 6, pagecount ).map((page) => (
         <button 
          className={page === currentPage ? 'active' : ''}
          onClick={() => postAdd(page)}>
              {page}
         </button>
         )) :
        page.slice(currentPage < 7 && currentPage !== 1 ? 1 : currentPage - 1, currentPage === 1 ? currentPage + 6 : currentPage < 7 ? 7 : currentPage + 5 ).map((page) => (
         <button 
          className={page === currentPage ? 'active' : ''}
          onClick={() => postAdd(page)}>
              {page}
         </button>
         ))}
        <button className='page_move' 
           onClick={() => postGo(currentPage)}>
            <NavigateNextIcon/>
        </button>
        <nav className='next'>next</nav>
       </div> : <></> }
      </div>}
    { followingIndexModal ? <FollowingIndex user={user} currentUser={props.user} setFollowingIndexModal={setFollowingIndexModal} 
                                            setPromptingAccountCreation={setPromptingAccountCreation}
                                            loggedInStatus={loggedInStatus}/>
                                             : 
                                            <></>
    }
    { followersIndexModal ? <FollowersIndex user={user} currentUser={props.user} setFollowersIndexModal={setFollowersIndexModal} 
                                            setPromptingAccountCreation={setPromptingAccountCreation}
                                            loggedInStatus={loggedInStatus}/>
                                             :
                                            <></>
    }
   </Fragment>
  )
  }
}

export default Profile