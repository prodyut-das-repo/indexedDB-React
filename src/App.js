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
  const [id, setId] = useState("");
  const [getData, setGetData] = useState([]);
  const [num, setNum] = useState(0);

  useEffect(() => {
    createCollectionIndexedDB();
    getAllData();
    console.log(allUserData);
  }, []);

  const handleDelete = (item) => {
    const dbPromise = idb.open("draft-data", 1);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result;
      const tx = db.transaction("emailData", "readwrite");
      const emailData = tx.objectStore("emailData");
      const data = emailData.delete(item.id);
      data.onsuccess = (query) => {
        console.log("deleted");
        getAllData();
      };
      data.onerror = (error) => {
        console.log(error);
      };
      tx.oncomplete = () => {
        db.close();
      };
    };
  };

  const handleFindData = () => {
    const dbPromise = idb.open("draft-data", 1);
    dbPromise.onsuccess = () => {
      console.log("start");
      const db = dbPromise.result;
      const tx = db.transaction("emailData", "readonly");
      const emailData = tx.objectStore("emailData");
      const data = emailData.get(id);
      data.onsuccess = (query) => {
        console.log("found");
        setGetData(query.srcElement.result);
      };
      data.onerror = (error) => {
        console.log(error);
      };
      tx.oncomplete = () => {
        db.close();
      };
    };
  };

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

  const handleSubmit = (num) => {
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
        if (num) {
          for (let index = 1; index <= num; index++) {
            const data = emailData.put({
              id: conversationId + index,
              conversationId: conversationId + index,
              name: name + index,
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
          }
        }
      };
    }
  };

  const clearAll = () => {
    const dbPromise = idb.open("draft-data", 1);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result;
      const tx = db.transaction("emailData", "readwrite");
      const emailData = tx.objectStore("emailData");
      const data = emailData.clear();
      data.onsuccess = (query) => {
        console.log("all cleared");
      };
      data.onerror = (error) => {
        console.log(error);
      };
      tx.oncomplete = () => {
        db.close();
        getAllData();
      };
    };
  };
  return (
    <div className="App row">
      <div className="col-md-6">
        <button className="btn btn-danger" onClick={clearAll}>
          Clear all data
        </button>
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
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(item)}
                  >
                    Delete
                  </button>
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
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <small id="emailHelp" className="form-text text-muted">
              We'll never share your details with anyone else.
            </small>
          </div>
        </form>
        <button className="btn btn-primary" onClick={() => handleSubmit(null)}>
          Add This Entry
        </button>{' '}
        <span>
          <input
            type="number"
            className="input-number"
            style={{ width: "100px" }}
            placeholder="Number"
            onChange={(e) => setNum(e.target.value)}
          />{' '}
          <button className="btn btn-primary" onClick={() => handleSubmit(num)}>
            Add Multi Entry
          </button>
        </span>
        <hr style={{ color: "white" }}></hr>
        <input
          type="text"
          className="form-control"
          placeholder="Get data by conversation Id"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <br></br>
        <button className="btn btn-info" onClick={handleFindData}>
          Get data by conversation Id
        </button>
        <br></br>
        <br></br>
        <p style={{ color: "white" }}>{JSON.stringify(getData)}</p>
      </div>
    </div>
  );
};

export default App;
