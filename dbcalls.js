import { collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from './firebase.js'

const collectionName = 'global-scoreboard'
const docName = 'scoreboard'
const globalScoreboardRef = collection(db, collectionName)
const globalScoreboardDoc = doc(globalScoreboardRef, docName)

export async function updateGlobalScoreboard(localScoreboard, globalScoreboard) {
  if (!Array.isArray(localScoreboard) || !Array.isArray(globalScoreboard)) return;
  const largestLocalLength = localScoreboard[0]?.length ?? 0
  const sortedGlobal = [...globalScoreboard].sort((a,b) => b.length - a.length);
  const smallestGlobalLength = sortedGlobal[sortedGlobal.length - 1]?.length ?? 0

  if (largestLocalLength > smallestGlobalLength) {
    const candidate = [...sortedGlobal];
    localScoreboard.forEach(element => {
      if (!candidate.includes(element)) {
        candidate.push(element);
      }
    });
    candidate.sort((a,b) => b.length - a.length)
    candidate.splice(5)
    try {
      await setDoc(globalScoreboardDoc, { words: candidate })
    } catch (error) {
      console.error('error:', error)
    }
  }
}