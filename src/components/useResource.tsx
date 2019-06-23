import { TResource } from '../types';
import { useState, useEffect } from 'react';
import firebase from '../firebase';

/**
 * Hook which provides a Resource record from Firebase
 *
 * @example
 * const CharityDisplay = props: {dataPath: string} => {
 *   const charityData: TResource | null = useResource(props.dataPath);
 *   return charityData ? (
 *     <div>
 *       <h1>{charityData.charityName}</h1>
 *       <p>{charityData.description}</p>
 *     </div>
 *   ) : (
 *     <Spinner />
 *   );
 * };
 */
function useResource(dataPath: string): TResource | null {
  const [resource, setResource] = useState(null);
  useEffect(() => {
    // Update 'resource' when the Firebase Realtime Database data
    // under the '/someData' path changes.
    const firebaseRef = firebase.database().ref(dataPath);
    const firebaseCallback = firebaseRef.on('value', snapshot => {
      if (!snapshot) {
        throw new Error('No data was provided by the backend');
      }
      setResource(snapshot.val());
    });
    return () => {
      // Un-register the listener on '/someData'.
      firebaseCallback &&
        firebaseRef &&
        firebaseRef.off('value', firebaseCallback as (
          a: firebase.database.DataSnapshot,
          b?: string | null
        ) => unknown);
    };
  }, [dataPath]);

  return resource;
}

export default useResource;
