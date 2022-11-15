import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
/**
 * indexedDB starts
 */

const idb =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB;

const createCollectionIndexedDB = () => {
  if (!idb) {
    console.log("error");
    return;
  }
  console.log(idb);
  const request = idb.open("draft-data", 1);
  request.onerror = (e) => {
    console.log("Error: ", e);
  };
  request.onupgradeneeded = (e) => {
    const db = request.result;
    if (!db.objectStoreNames.contains("emailData")) {
      db.createObjectStore("emailData", { keyPath: "id" });
    }
  };
  request.onsuccess = () => {
    console.log("Success");
  };
};

const App = () => {
  const [conversationId, setCoversationId] = useState("");
  const [name, setName] = useState("");
  const [allUserData, setAllUserData] = useState([]);

  useEffect(() => {
    createCollectionIndexedDB();
    getAllData();
  }, []);

  const getAllData = () => {
    const dbPromise = idb.open("draft-data", 1);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result;
      const tx = db.transaction("emailData", "readonly");
      const emailData = tx.objectStore("emailData");
      const data = emailData.getAll();
      data.onsuccess = (query) => {
        setAllUserData(query.srcElement.result);
      };
      data.onerror = (error) => {
        console.log(error);
      };
      tx.oncomplete = () => {
        db.close();
      };
    };
  };

  const handleSubmit = () => {
    const dbPromise = idb.open("draft-data", 1);
    if (conversationId && name) {
      dbPromise.onsuccess = () => {
        const db = dbPromise.result;
        const tx = db.transaction("emailData", "readwrite");
        const emailData = tx.objectStore("emailData");
        const data = emailData.put({
          id: conversationId,
          conversationId,
          name,
        });
        data.onsuccess = () => {
          tx.oncomplete = () => {
            db.close();
            console.log("user added");
          };
          getAllData();
        };
        data.onerror = (error) => {
          alert(error);
          console.log(error);
        };
      };
    }
  };
  return (
    <div className="App">
      <div className="col-md-6">
        <table className="table table-dark">
          <thead>
            <tr>
              <th scope="col">Conversation Id</th>
              <th scope="col">Name</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {allUserData.map((item) => (
              <tr key={item?.id}>
                <td>{item?.conversationId}</td>
                <td>{item?.name}</td>
                <td>
                  <button className="btn btn-success">Edit</button>{" "}
                  <button className="btn btn-danger">Delete</button>{" "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="col-md-6">
        <form>
          <div className="form-group">
            <label htmlFor="exampleInputEmail1">Conversation Id</label>
            <br></br>
            <input
              type="text"
              className="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              placeholder="Enter id"
              value={conversationId}
              onChange={(e) => setCoversationId(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="exampleInputPassword1">Name</label>
            <br></br>
            <input
              type="text"
              className="form-control"
              id="exampleInputPassword1"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <small id="emailHelp" className="form-text text-muted">
              We'll never share your details with anyone else.
            </small>
          </div>
          <br></br>
        </form>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default App;
