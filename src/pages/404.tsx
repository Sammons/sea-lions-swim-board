import * as React from "react"
import { HeadFC, navigate } from "gatsby"

const NotFoundPage = () => {
  return (
    navigate('/controller')
  )
}

export default NotFoundPage

export const Head: HeadFC = () => <title>Not found</title>
