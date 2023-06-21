import { useState, useContext } from 'react';
import MenuItem, { MenuEntry } from './MenuItem';
import { SettingsContext } from '../Context/SettingsManager';

declare global {
	interface Window {
	  api?: any;
	  findEditor: Function
	}
}


type MainMenuProps = {
	enabled: boolean,
	showSidebar: boolean,
	showStatus: boolean,
	showConsole: boolean,
	showThemeEditor: boolean
}


export default function MainMenu({ enabled, showSidebar, showStatus, showConsole, showThemeEditor }: MainMenuProps) {
	const [selected, setSelected] = useState('');
	const c_active = enabled ? '' : ' is-disabled';
	//const settings = useContext(SettingsContext);

	return (
		<div id="main-menu" tabIndex={0} onBlur={() => setSelected('')}>
			<MenuItem label='File' click={() => setSelected('file')} active={selected=='file'}>
				<MenuEntry click2={() => setSelected('')} label='New Game' hotKey='Ctrl+N' click={() => window.api.newGame()} />
				<MenuEntry click2={() => setSelected('')} label='Open Project...' hotKey='Ctrl+O' click={() => window.api.openFolder()} />
				<hr />
				<MenuEntry click2={() => setSelected('')} disabled={!enabled} label='Close Project' click={(() => window.api.menuCloseProject())} />
				<MenuEntry click2={() => setSelected('')} disabled={!enabled} label='Save' hotKey='Ctrl+S' click={() => window.api.menuSave()} />
				<MenuEntry click2={() => setSelected('')} disabled={!enabled} label='Save Copy...' hotKey='Ctrl+Shift+A' click={() => window.api.menuSaveCopy()} disabled={true} />
				<MenuEntry click2={() => setSelected('')} disabled={!enabled} label='Save All' hotKey='Ctrl+Shift+S' click={() => window.api.menuSaveAll()} disabled={true} />
				<hr />
				<MenuEntry click2={() => setSelected('')} disabled={!enabled} label='Game Properties' click={() => window.api.menuGameProperties()} />
				<MenuEntry click2={() => setSelected('')} disabled={!enabled} label='Reveal In Explorer' click={() => window.api.menuReveal()} disabled={true} />
				<MenuEntry click2={() => setSelected('')} disabled={!enabled} label='Export...' click={() => window.api.menuExport()} disabled={true} />
				<hr />
				<MenuEntry click2={() => setSelected('')} label='Exit' hotKey='Alt+F4' click={() => window.api.menuExit()} />
			</MenuItem>
			<MenuItem label='Edit' disabled={!enabled} click={() => setSelected('edit')} active={selected=='edit'}>
				<MenuEntry click2={() => setSelected('')} label='Undo' hotKey='Ctrl+Z' click={() => window.api.menuUndo()} />
				<MenuEntry click2={() => setSelected('')} label='Redo' click={() => window.api.menuRedo()} />
				<MenuEntry click2={() => setSelected('')} label='Cut' hotKey='Ctrl+X' click={() => window.api.menuCut()} />
				<MenuEntry click2={() => setSelected('')} label='Copy' hotKey='Ctrl+C' click={() => window.api.menuCopy()} />
				<MenuEntry click2={() => setSelected('')} label='Paste' hotKey='Ctrl+V' click={() => window.api.menuPaste()} />
				<hr />
				<MenuEntry click2={() => setSelected('')} label='Delete' hotKey='Del' click={() => window.api.menuDelete()} />
				<MenuEntry click2={() => setSelected('')} label='Select All' hotKey='Ctrl+A' click={() => window.api.menuSelectAll()} />
			</MenuItem>
			<MenuItem label='Run' disabled={!enabled} click={() => setSelected('run')} active={selected=='run'}>
				<MenuEntry click2={() => setSelected('')} label='Start Game' hotKey='F5' click={() => window.api.menuRun()} />
				<MenuEntry click2={() => setSelected('')} label='Start Without Debugging' hotKey='F6' click={() => window.api.menuRunWithoutDebug()} />
			</MenuItem>
			<MenuItem label='View' click={() => setSelected('view')} active={selected=='view'}>
				<MenuEntry click2={() => setSelected('')} label='Sidebar' hotKey='Ctrl+B' click={() => window.api.menuSidebar()} checked={showSidebar} disabled={!enabled} />
				<MenuEntry click2={() => setSelected('')} label='Status Bar' hotKey='Ctrl+Shift+B' click={() => window.api.menuStatusBar()} checked={showStatus} disabled={!enabled} />
				<MenuEntry click2={() => setSelected('')} label='Console' hotKey='Ctrl+Shift+C' click={() => window.api.menuConsole()} checked={showConsole} disabled={!enabled} />
				<MenuEntry click2={() => setSelected('')} label='Theme Editor' hotKey='Ctrl+Shift+D' click={() => window.api.menuThemeEditor()} checked={showThemeEditor} />
				<hr />
				<MenuEntry click2={() => setSelected('')} label='Actual Size' click={() => window.api.menuActualSize()} />
				<MenuEntry click2={() => setSelected('')} label='Zoom In' click={() => window.api.menuZoomIn()} />
				<MenuEntry click2={() => setSelected('')} label='Zoom Out' click={() => window.api.menuZoomOut()} />
				<hr />
				<MenuEntry click2={() => setSelected('')} label='Show DevTools' click={() => window.api.menuDevTools()} />
				<MenuEntry click2={() => setSelected('')} label='Toggle FullScreen' hotKey='F11' click={() => window.api.menuFullScreen()} />
			</MenuItem>
			<MenuItem label='Tools' click={() => setSelected('tools')} active={selected=='tools'}>
				<MenuEntry click2={() => setSelected('')} label='Options' hotKey='F8' click={() => window.api.menuOptions()} />
				<MenuEntry disabled={!enabled} click2={() => setSelected('')} label='Clear Console' click={() => window.api.menuClearConsole()} />
			</MenuItem>
			<MenuItem label='Help' click={() => setSelected('help')} active={selected=='help'}>
				<MenuEntry click2={() => setSelected('')} label='Learn More' hotKey='F1' click={() => window.api.menuHelp()} />
			</MenuItem>

			<div className="buttons" style={{ flexGrow: 1, textAlign: 'right', display: enabled?'block':'none' }}>
				<div style={{display: 'inline-block'}}>
					<a className="menu-item is-disabled" title="Stop Game">
						<span className="menu-label"><i className='icon-stop'></i></span>
					</a>
					<a className="menu-item is-disabled" title="Pause Game">
						<span className="menu-label"><i className='icon-pause'></i></span>
					</a>
					<a className="menu-item" title="Start Game" onClick={() => window.api.menuRun()}>
						<span className="menu-label"><i className='icon-play'></i></span>
					</a>
				</div>
			</div>

		</div>
	);
}