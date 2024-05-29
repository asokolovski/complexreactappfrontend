import React, { useState, useReducer, useEffect, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { useImmerReducer } from 'use-immer'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'
import Axios from 'axios'
Axios.defaults.baseURL = process.env.BACKENDURL || "https://myreactbackendtest-x070.onrender.com"

import StateContext from './StateContext'
import DispatchContext from './DispatchContext'

// My Components
import Header from './components/Header'
import HomeGuest from './components/HomeGuest'
import Home from './components/Home'
import Footer from './components/Footer'
import About from './components/About'
import Terms from './components/Terms'
const CreatePost = React.lazy(() => import("./components/CreatePost"))
const ViewSinglePost = React.lazy(()=>import("./components/ViewSinglePost"))
import FlashMessages from './components/FlashMessages'
import Profile from './components/Profile'
import EditPost from './components/EditPost'
import NotFound from './components/NotFound'
const Search = React.lazy(()=> import("./components/Search"))
const Chat = React.lazy(()=>import('./components/Chat'))
import LoadingDotsIcon from './components/LoadingDotsIcon'
import Page from './components/page'
function Main() {
    const initialState = {
        loggedIn: Boolean(localStorage.getItem("ComlpexappToken")),
        flashMessages: [],
        user: {
            token: localStorage.getItem("ComlpexappToken"),
            username: localStorage.getItem("ComlpexappUsername"),
            avatar: localStorage.getItem("ComlpexappAvatar"),
        },
        isSearchOpen: false,
        isChatOpen: false,
        unreadChatCount: 0
    }

    function ourReducer(draft, action) {
        switch (action.type) {
            case "login":
                draft.loggedIn = true
                draft.user = action.data
                return
            case "logout":
                draft.loggedIn = false
                return
            case "flashMessage":
                draft.flashMessages.push(action.value)
                return
            case "openSearch":
                draft.isSearchOpen = true
                return
            case "closeSearch":
                draft.isSearchOpen = false
                return
            case "toggleChat":
                draft.isChatOpen = !draft.isChatOpen
                return
            case "closeChat":
                draft.isChatOpen = false
                return
            case "incrementUnreadChatCount":
                draft.unreadChatCount++
                return
            case "clearUnreadChatCount":
                draft.unreadChatCount = 0
                return
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)
    useEffect(() => {
        if (state.loggedIn) {
            localStorage.setItem("ComlpexappToken", state.user.token)
            localStorage.setItem("ComlpexappUsername", state.user.username)
            localStorage.setItem("ComlpexappAvatar", state.user.avatar)
        }
        else {
            localStorage.removeItem("ComlpexappToken")
            localStorage.removeItem("ComlpexappUsername")
            localStorage.removeItem("ComlpexappAvatar")
        }

    }, [state.loggedIn])

    useEffect(() => {
        if (state.loggedIn) {
            //send axios request here
            const ourRequest = Axios.CancelToken.source()
            async function fetchResults() {
                try {
                    const response = await Axios.post("/checkToken", { token: state.user.token }, { cancelToken: ourRequest.token })
                    if (!response.data) {
                        dispatch({ type: "logout" })
                        dispatch({ type: "flashMessage", value: "Your session has expired, please login again" })
                    }
                } catch (error) {
                    console.log("there was a problem or the request was canceled")
                }
            }
            fetchResults()
            return () => ourRequest.cancel()

        }

    }, [])

    return (
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                <BrowserRouter>
                    <FlashMessages messages={state.flashMessages} />
                    <Header />
                    <Suspense fallback={<LoadingDotsIcon />}>
                        <Routes>
                            <Route path="/" element={state.loggedIn ? <Home /> : <HomeGuest />} />
                            <Route path="/about-us" element={<About />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route path="/create-post" element={<CreatePost />} />
                            <Route path="/post/:id" element={<ViewSinglePost />} />
                            <Route path="/profile/:username/*" element={<Profile />} />
                            <Route path="/post/:id/edit" element={<EditPost />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                    <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
                        <div className='search-overlay'>
                            <Suspense fallback = "">
                                <Search />
                            </Suspense>
                        </div>
                    </CSSTransition>
                    <Suspense fallback = "">
                        {state.loggedIn && <Chat />}
                    </Suspense>
                    <Footer />
                </BrowserRouter>
            </DispatchContext.Provider>
        </StateContext.Provider>
    )
}


const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<Main />)

if (module.hot) {
    module.hot.accept()
}
