const fs = require('fs');

/**
 * 
 * @param {string} _path the fs path to retrieve data from
 * @param {any} defaultValue *optional* value to return when _path leads nowhere
 * @returns {any} defaultValue or undefined
 */
const get = (_path, defaultValue) => new Promise((resolve, reject) => {
    fs.readFile(_path, async(err, file) => {

        if (err) {
            const isEmpty = await Promise.resolve(
                (err.toString().indexOf('no such file or directory') >= 0)
            );

            !isEmpty && reject(err);
        }

        resolve(
            file
            ? JSON.parse(file?.toString())
            : defaultValue || undefined 
        )
    })
})
module.exports.get = get;

module.exports.merge = (_path, _merge) => new Promise(async(resolve, reject) => {
    const current = await get(_path, {});

    const updated = await Promise.resolve({...current, ..._merge});
    await fs.writeFile(_path, JSON.stringify(updated), err => {
        if (err) reject(err);
    
        console.log(`file written to ${_path}`);
        resolve(!err);
        
    });
})