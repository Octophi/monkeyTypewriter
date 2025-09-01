import { collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from './firebase.js'

const collectionName = 'global-scoreboard'
const docName = 'scoreboard'
const globalScoreboardRef = collection(db, collectionName)
const globalScoreboardDoc = doc(globalScoreboardRef, docName)

export async function updateGlobalScoreboard(localScoreboard, globalScoreboard) {
  if (!Array.isArray(localScoreboard) || !Array.isArray(globalScoreboard)) return;
  const largestLocalLength = localScoreboard[0]?.length ?? 0
  globalScoreboard.sort((a,b) => b.length - a.length);
  const smallestGlobalLength = globalScoreboard[globalScoreboard.length - 1]?.length ?? 0

  if (largestLocalLength > smallestGlobalLength) {
    localScoreboard.forEach(element => {
      if (!globalScoreboard.includes(element)) {
        globalScoreboard.push(element);
      }
    });
    globalScoreboard.sort((a,b) => b.length - a.length)
    globalScoreboard.splice(5)
    try {
      await setDoc(globalScoreboardDoc, { words: globalScoreboard })
    } catch (error) {
      console.error('error:', error)
    }
  }
}