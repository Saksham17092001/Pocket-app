import React, { useState, useRef, useEffect } from 'react';
import styles from "./Homepage.module.css";
import mainImg from "../assets/main.png";
import lockImg from "../assets/lock.png";

const Homepage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#B38BFA');  
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [noteText, setNoteText] = useState('');
  const modalRef = useRef();

  
  useEffect(() => {
    // Load groups from local storage
    const savedGroups = JSON.parse(localStorage.getItem('groups')) || [];
    setGroups(savedGroups);

    // Restore the selected group based on last saved selection
    const lastSelectedGroupName = localStorage.getItem('selectedGroupName');
    if (lastSelectedGroupName) {
      const lastSelectedGroup = savedGroups.find(group => group.name === lastSelectedGroupName);
      if (lastSelectedGroup) {
        setSelectedGroup(lastSelectedGroup);
      }
    }
  }, []);


  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem('groups', JSON.stringify(groups));
    }
  }, [groups]);

  useEffect(() => {
    if (selectedGroup) {
      localStorage.setItem('selectedGroupName', selectedGroup.name);
    } else {
      localStorage.removeItem('selectedGroupName');
    }
  }, [selectedGroup]);

  const openModal = () => setIsModalOpen(true);

  const closeModal = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setIsModalOpen(false);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      alert("Group name cannot be empty.");
      return;
    }
  
    const initials = groupName
      .split(" ")
      .map(word => word[0]?.toUpperCase())
      .join("").slice(0,2);
  
    const newGroup = {
      name: groupName,
      initials,
      color: selectedColor,
      notes: [],
    };
  
    setGroups([...groups, newGroup]);
    setGroupName("");
    setSelectedColor("#B38BFA"); 
    setIsModalOpen(false);
  };
  

  const selectGroup = (group) => {
    setSelectedGroup(group);
    setNoteText('');
  };

  const handleAddNote = () => {
    if (noteText.trim() && selectedGroup) {
      const dateNow = new Date();
      const newNote = {
        text: noteText,
        createdDate: dateNow,
        lastUpdatedDate: dateNow,
      };

      // Update the notes for the selected group
      const updatedSelectedGroup = {
        ...selectedGroup,
        notes: [...selectedGroup.notes, newNote]
      };

      const updatedGroups = groups.map(group =>
        group.name === selectedGroup.name ? updatedSelectedGroup : group
      );

      setGroups(updatedGroups); // Update the groups array with the new note
      setSelectedGroup(updatedSelectedGroup); // Update the selected group to include the new note
      setNoteText('');
    }
  };

  // Add event listener for closing modal on outside click
  useEffect(() => {
    document.addEventListener('mousedown', closeModal);
    return () => document.removeEventListener('mousedown', closeModal);
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.left}>
        <h2>Pocket Notes</h2>
        <ul>
          {groups.map((group, index) => (
            <li 
              key={index} 
              className={`${styles.groupItem} ${selectedGroup?.name === group.name ? styles.selectedGroup : ''}`}
              onClick={() => selectGroup(group)}
            >
              <div 
                className={styles.groupInitials} 
                style={{ backgroundColor: group.color }}
              >
                {group.initials}
              </div>
              <span>{group.name}</span>
            </li>
          ))}
        </ul>
        <button className={styles.button} onClick={openModal}>+</button>
      </div>

      <div className={styles.right}>
        {selectedGroup ? (
          <div className={styles.notesContainer}>
            <div className={styles.notesHeader}>
              <span 
                className={styles.groupInitialsHeader} 
                style={{ backgroundColor: selectedGroup.color }}
              >
                {selectedGroup.initials}
              </span>
              <span>{selectedGroup.name}</span>
            </div>
            <div className={styles.notesArea}>
              {selectedGroup.notes.map((note, index) => {
                const dateObj = new Date(note.createdDate);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                });

                return (
                  <div key={index} className={styles.noteBubble}>
                    <p>{note.text}</p>
                    <span className={styles.timestamp}>
                      {formattedDate} <b>•</b> {formattedTime}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className={styles.inputContainer}>
              <input 
                type="text"
                placeholder="Enter your text here..............."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <button 
                onClick={handleAddNote} 
                className={`${styles.enterButton} ${noteText.trim() ? '' : styles.disabledButton}`}
                disabled={!noteText.trim()}
              >
                &#10148;
              </button> 
            </div>
          </div>
        ) : (
          <div className={styles.welcomeContainer}>
            <img src={mainImg} style={{ height: '250px', width: '500px' }} alt="Main"/>
            <h1>Pocket Notes</h1>
            <p>Send and receive messages without keeping your phone online.</p>
            <p>Use Pocket Notes on up to 4 linked devices and 1 mobile phone.</p>
            <div className={styles.encryptionNote}>
              <img src={lockImg} style={{ width: '12px', height: '15px' }} alt="Lock"/> end-to-end encrypted
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} ref={modalRef}>
            <h2>Create New Group</h2>
            <label><b>Group Name</b></label>
            <input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className={styles.input}
            />
            <div className={styles.colorPicker}>
              <label><b>Choose colour</b></label>
              <div className={styles.colors}>
                {['#B38BFA', '#FF79F2', '#43E6FC', '#F19576', '#0047FF', '#6691FF'].map((color) => (
                  <span
                    key={color}
                    className={`${styles.color} ${selectedColor === color ? styles.selectedColor : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  ></span>
                ))}
              </div>
            </div>
            <button className={styles.createButton} onClick={handleCreateGroup}>Create</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
