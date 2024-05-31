
import  { useState, useEffect } from 'react';
import axios from 'axios';
import {message} from "antd"
const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const res = await axios.get('http://localhost:8000/images');
    setImages(res.data);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Photo will uploaded successfully')
      fetchImages();
    } catch (err) {
      message.warning("please select image  ")
      console.error(err);
      // message.warning(err)
    }
  };
  const handleDelete = async(id) =>{
      try {
        await axios.delete(`http://localhost:8000/images/${id}`)
        message.success('Photo will deleted  successfully')
        setImages(images.filter((images)=> images.id !== id))
      } catch (err) {
      message.warning("please try again")
      console.error(err)
      }
  }
  return (
    <div className="grid justify-center  w-full items-center p-10 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Photo Album</h1>
     <div className='flex gap-3'>
     <input
        type="file"
        onChange={handleFileChange}
        className="mb-4 p-2 border border-gray-300"
      />
      <button
        onClick={handleUpload}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Upload
      </button>
     </div>
      <div className="grid grid-cols-5 gap-4">
        {
          images.length > 0? (
            images.map((image) => (
              <div key={image.id} className='grid w-full'>
                <img
                key={image.id}
                src={`http://localhost:8000/uploads/${image.image}`}
                alt="Uploaded"
                className="w-full h-48 object-cover rounded-xl"
              /> 
              <button  className="mb-4 px-4 py-1 bg-blue-500 rounded-xl text-white  hover:bg-blue-300" onClick={()=>handleDelete(image.id)}>Delete</button>
              </div>
            
            ))
          ):(<h1 className='flex text-xl font-bold mb-6'>There is no more image can  you please upload</h1>)
        }
      
      </div>
    </div>
  );
};

export default App;
