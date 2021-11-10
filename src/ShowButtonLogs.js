import logger from "./utils/logger";
import { useState } from "react";

const ShowButtonLogs = () => {
  return (
    <ol>
      { logger.logs.map ((lg,i) =>{
        <li key={i}> lg </li>
      })
    }
    </ol>
  )
}

export default ShowButtonLogs;