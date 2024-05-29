import React from "react"
import Page from "./page"
import { Link } from "react-router-dom"

function NotFound() {
    return (
        <Page title="404 Not Found">
            <div className="text-center">
                <h2>Whoops, we cannot find that page.</h2>
                <p>Click here to go back to <Link to="/">Homepage</Link></p>
            </div>
        </Page>
    )
}

export default NotFound