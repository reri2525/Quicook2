import React, { Fragment, useEffect, useState } from 'react'
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Link } from "react-router-dom";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ReplayIcon from '@mui/icons-material/Replay';
import PostShow from './PostShow';
function Home(props) {
  const [postShowModal, setPostShowModal] = useState(false); 
  const [postShowNumber, setPostShowNumber] = useState("")
  const history = useHistory();
  const [postall, setPostall] = useState([])
  const [pagecount, setPagecount] = useState(props.pagecount)
  const [currentPage, setCurrentPage] = useState(props.currentPage)
  const page = [...Array(pagecount).keys()].map((i) => i + 1);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [heartedPosts, setHeartedPosts] = useState([]);
  const [heartcount, setHeartcount] = useState(0)
  const [postExist, setPostExist] = useState(true)

  useEffect(() => {
    setPostall([])
    window.scrollTo(0, 0);
    postAllGet();
  }, [currentPage])
  const postShow = (e) => {
    setPostShowModal(true)
    setPostShowNumber(e)
  }
  const postAllGet = () =>{
     axios.get("http://localhost:3001/posts", { params: { page: currentPage }, withCredentials: true })
    .then(response => {
      if (response.data.status) {
        const data = response.data.post_all
        setPostall(data)
        setPagecount(response.data.total_pages)
        console.log(data)
        for (let i = 0; i < data.length; i++) {
          bookmarkExist(data[i]);
        }
        for (let i = 0; i < data.length; i++) {
          heartExist(data[i]);
        }
        setPostExist(true)
      } else {
        setPostExist(false)
        console.log("失敗")
      }
    })
  }
  const postAdd = (page) => {
    setCurrentPage(page)
    window.scrollTo(0, 0);
  }
  const postBack = (currentPage) => {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1)
      }
    window.scrollTo(0, 0);
  }
  const postGo = (currentPage) => {
    if (currentPage !== pagecount) {
      setCurrentPage(currentPage)
    }
    window.scrollTo(0, 0);
  }
  const handleBookmark = (post) => {
   if  (bookmarkedPosts.includes(post.id)) {
    props.bookmarkDestroy(post)
    setBookmarkedPosts(bookmarkedPosts.filter(id => id !== post.id));
    console.log(bookmarkedPosts)
   } else {
    props.bookmarkCreate(post)
    setBookmarkedPosts([...bookmarkedPosts, post.id]);
   }
  }
  const bookmarkExist = (post) => {
    setBookmarkedPosts((prevBookmarkedPosts) => {
      if (post.bookmarks[0]) {
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
     console.log(heartedPosts)
    } else {
     props.heartCreate(post)
     setHeartedPosts([...heartedPosts, post.id]);
     post.heart_count = post.heart_count + 1
    }
   }
  const heartExist = (post) => {
    setHeartedPosts((prevHeartedPosts) => {
      if (post.hearts[0]) {
        return [...prevHeartedPosts, post.id];
      } else {
        return prevHeartedPosts.filter(id => id !== post.id);
      }
    });
  }
  return (
    <Fragment> 
      { postall[0] ? 
      <div className='post_container'>
       {postExist ? <></> : <h1>誰も投稿してないの！？まじ？</h1>} 
       {postall.map((value, key) => {
         return (
         <div className='post' key={key} onClick={() => postShow(postall[key].id)}>
           <div className='head'>
             <div className='icon'>
             <img src={postall[key].user.avatar.url}></img>
             </div>
             <Link to={`/profile/${postall[key].user.id}`}>{postall[key].user.name}</Link>
               <div className='bookmark' onClick={(e) => {e.stopPropagation(); handleBookmark(postall[key]); } }>
                    {bookmarkedPosts.includes(postall[key].id) ? <BookmarkIcon/> : <BookmarkBorderIcon/>}
               </div>
           </div>
           <div className='middle'>
              { postall[key].file_type === "image" ? <img src={postall[key].image.url}></img> : <></> }
              { postall[key].file_type === "video" ? <video controls src={postall[key].image.url}></video> : <></>}
           </div>
           <div className='foot'>
             <a>{postall[key].title}</a>
             <div className='favorite' onClick={(e) => {e.stopPropagation(); handleHeart(postall[key]); }}>
                  {heartedPosts.includes(postall[key].id) ? <FavoriteIcon style={{ color: 'red' }}/> : <FavoriteBorder/>}
             </div>
             <a className='heart_count'>{postall[key].heart_count}</a>
           </div>
         </div>
         )
       })}
      </div>
      : <></> }
      { postall.length === 0 && postExist ? 
               <div className='post_skeleton_container'>
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
        <button className='page_move' onClick={() => postGo(currentPage)}><NavigateNextIcon/></button><nav className='next'>next</nav>
       </div> : <></> }
      </div>}
      {postShowModal ?  <PostShow postShowModal={postShowModal} 
                                  setPostShowModal={setPostShowModal} 
                                  postShowNumber={postShowNumber} 
                                  user={props.user}
                                  bookmarkCreate={props.bookmarkCreate} bookmarkDestroy={props.bookmarkDestroy}
                                  heartCreate={props.heartCreate} heartDestroy={props.heartDestroy}
                                  bookmarkedPosts={bookmarkedPosts} setBookmarkedPosts={setBookmarkedPosts}
                                  heartedPosts={heartedPosts} setHeartedPosts={setHeartedPosts}
                                  postall={postall}
                                  />
                                   : <></>}
   </Fragment>
  )
} 

export default Home