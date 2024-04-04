const path = require('path');
const { fs, log, util } = require('vortex-api');
const GAME_ID = 'readyornot';
const STEAMAPP_ID = '1144200';
const MOD_FILE_EXT = ".pak";

function main(context) {
	context.registerGame({
        id: GAME_ID,
        name: 'Ready Or Not',
        mergeMods: true,
        queryPath: findGame,
        supportedTools: [],
        queryModPath: () => 'ReadyOrNot/Content/Paks',
        logo: 'gameart.jpg',
        executable: () => 'ReadyOrNot.exe',
        requiredFiles: [
          'ReadyOrNot.exe',
          'ReadyOrNot/Binaries/Win64/ReadyOrNot-Win64-Shipping.exe',
        ],
        stopPatterns: [
            '.*\.pak'
        ],
        setup: prepareForModding,
        environment: {
          SteamAPPId: STEAMAPP_ID,
        },
        details: {
          steamAppId: STEAMAPP_ID,
        },
      });

	context.registerInstaller('readyornot-mod', 25, testSupportedContent, installContent);

	return true;
}

function findGame() {
    return util.GameStoreHelper.findByAppId([STEAMAPP_ID]).then(game => game.gamePath);
}

function prepareForModding(discovery) {
    return fs.ensureDirWritableAsync(path.join(discovery.path, 'ReadyOrNot', 'Content', 'Paks'));
}

function testSupportedContent(files, gameId) {
    let supported = (gameId === GAME_ID) &&
      (files.find(file => path.extname(file).toLowerCase() === MOD_FILE_EXT)!== undefined);
  
    return Promise.resolve({
      supported,
      requiredFiles: [],
    });
}

function installContent(files) {
    const modFile = files.find(file => path.extname(file).toLowerCase() === MOD_FILE_EXT);
    const idx = modFile.indexOf(path.basename(modFile));

    const filtered = files.filter(file => 
      ((!file.endsWith(path.sep)) && (file.endsWith("pak"))));
    
    console.log("TESTING: " + filtered)
  
    const instructions = filtered.map(file => {
      return {
        type: 'copy',
        source: file,
        destination: path.join(file.substr(idx)),
      };
    });
  
    return Promise.resolve({ instructions });
  }

module.exports = {
    default: main,
};