const userData = {};

const setUserData = (username, socket) => {
    userData[username] = socket;
}

const getUserData = (username) => {
    return userData[username];
}

const getUserAllData = () => {
    return userData;
}

const deleteUserData = (username) => {
    delete userData[username];
}

module.exports = {
    setUserData, 
    getUserData, 
    getUserAllData,
    deleteUserData
};