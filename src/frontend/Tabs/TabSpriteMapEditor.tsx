import React, { useRef, useEffect, useState, useContext, CSSProperties } from 'react';
import { SettingsContext } from '../Context/SettingsManager';
import TabToolbar from '../Components/TabToolbar';
import Button from '../Components/Button';
import ToggleButton from '../Components/ToggleButton';
import GroupBox from '../Components/GroupBox';
import SpriteMapViewport from '../Components/SpriteMapViewport';
import ListBox from '../Components/ListBox';

import '../Resources/css/sprite-map-editor.css';
import { classList } from '../helpers';

type ComponentProps = {
	guid: string,
	filePath:string,
	active: boolean,
	changed: boolean,
	labelChanged: Function,
	onSetData: Function,
	onPickImage: Function
};
type SpriteMapType = {
	image: string,
	animations: Array<AnimationType>
};
type AnimationType = {
	name: string,
	frames: Array<FrameType>
};
type FrameType = {
	delay?: string,
	coords?: string,
	flip_x?: boolean,
	flip_y?: boolean
};


export default function TabSpriteMapEditor(props: ComponentProps) {
	const [data, setData] = useState(null as SpriteMapType); // the loaded sprite map data.
	const [imageData, setImageData] = useState(''); // image data for the main display.
	const [frameData, setFrameData] = useState(''); // image data for the current preview frame.
	const [groups, setGroups] = useState([]); // list of loaded group names.
	const [group, setGroup] = useState(''); // name of the selected group.
	const [groupIndex, setGroupIndex] = useState(-1); // the array index of the selected group.
	const [frames, setFrames] = useState([]); // list of frame labels to display.
	const [frame, setFrame] = useState(''); // the selected frame label.
	const [frameObj, setFrameObj] = useState({ delay:'', coords:'', flip_x:false, flip_y:false } as FrameType); // info about the selected frame.
	const [aniObj, setAniObj] = useState(null as AnimationType); // info about the selected group/animation.
	const [preview, setPreview] = useState(false); // weather or not to show the preview screen.
	const [zoom, setZoom] = useState(1); // the zoom factor.
	const [playing, setPlaying] = useState(false);
	const settings = useContext(SettingsContext); // app settings context.
	const image = useRef(null);
	const previewCanvas = useRef(null);


	// ########################################################################
	// Use Effect Handlers
	// ########################################################################


	useEffect(() => {
		const fetchData = async(thePath:string) => {
			const theJSON = await window.api.openFile(thePath);
			const theResponse = JSON.parse(theJSON);
			const data = JSON.parse(theResponse.data);
			setData(data);
			if (data.animations[0]) {
				// build the group list.
				if (data && data.animations != null) {
					const _groups = new Array<string>();
					data.animations.forEach((t:any) => {
						_groups.push(t.name);
					});
					setGroups(_groups);
				}
				// finally choose the first group.
				setGroup(data.animations[0].name);
			}
			props.labelChanged(theResponse.label);
			props.onSetData(theResponse.data, false);
		};
		fetchData(props.filePath);
	}, []);


	useEffect(() => {
		if (data) {
			loadImage();
		}
	}, [data]);


	useEffect(() => {
		if (group) {
			const _group = findGroup(group);
			const _groupIndex = groups.indexOf(group);
			const _frames = new Array<string>();
			if (_group) {
				for (var i=0; i<_group.frames.length; i++) {
					_frames.push(`Frame ${i+1}`);
				}
			}
			setAniObj(_group);
			setGroupIndex(_groupIndex);
			setFrames(_frames);
			setFrame('Frame 2');
			setTimeout(() => setFrame('Frame 1'), 1);
		}
	}, [group]);


	useEffect(() => {
		if (frame) {
			const frameIndex = frames.indexOf(frame);
			const _group = findGroup(group);
			if (_group && _group.frames) {
				const _frame = _group.frames[frameIndex];
				setFrameObj({
					coords: _frame.coords,
					delay: _frame.delay,
					flip_x: _frame.flip_x,
					flip_y: _frame.flip_y
				});
			}
		}
		else {
			setFrameObj({ coords:'', delay:'', flip_x:false, flip_y:false });
		}
	}, [frame]);


	useEffect(() => {
		nextPreviewFrame();
	}, [frameObj]);


	useEffect(() => {
		if (playing == true) {
			nextPreviewFrame();
		}
	}, [playing]);


	// ########################################################################
	// Functions
	// ########################################################################


	const loadImage = async () => {
		const theJSON = await window.api.openImage(data.image, true);
		const theResponse = JSON.parse(theJSON);
		setImageData(theResponse.data);
	};


	const findGroup = (groupName:string) : null|AnimationType => {
		if (!data || !data.animations) return null;
		for (const [i, animation] of data.animations.entries()) {
			if (animation.name == groupName) {
				return animation;
			}
		}
		return null;
	}


	const updateFrame = (newFrame:any) => {
		// update the underlying sprite map data.
		const frameIndex = frames.indexOf(frame);
		const newData = JSON.parse(JSON.stringify(data));

		if (newFrame.delay < 10) newFrame.delay = 10;

		newData.animations[groupIndex].frames[frameIndex] = newFrame;
		setData(newData);
		props.onSetData(JSON.stringify(newData, null, 2), true);
		setFrameObj(newFrame);
	}


	const updateZoom = (factor:number) => {
		setZoom(factor);
	};


	const nextPreviewFrame = () => {
		if (!frameObj) return;
		if (!image.current) return;
		if (!previewCanvas.current) return;

		const _canvas = previewCanvas.current as HTMLCanvasElement;
		const p = (frameObj.coords ?? '0,0,0,0').split(',');
		if (p.length > 3) {
			const x = parseInt(p[0].trim());
			const y = parseInt(p[1].trim());
			const w = parseInt(p[2].trim());
			const h = parseInt(p[3].trim());
			if (w <= 0 || h <= 0) return;

			const _ctx = _canvas.getContext("2d");
			_ctx.clearRect(0, 0, w, h);
			_ctx.save();
			_ctx.scale(
				frameObj?.flip_x == true ? -1 : 1,
				frameObj?.flip_y == true ? -1 : 1
			);
			const ww = frameObj?.flip_x == true ? w*-1 : w;
			const hh = frameObj?.flip_y == true ? h*-1 : h;

			_ctx.drawImage(image.current, x, y, w, h, 0, 0, ww, hh);
			_ctx.restore();

			if (playing && frames.length > 1) {
				setTimeout(() => {
					const _index = frames.indexOf(frame);
					let _next_index = _index + 1;
					if (_next_index == frames.length) _next_index = 0; 
					setFrame(frames[_next_index]);
				}, parseInt(frameObj?.delay) ?? 1000);
			}
		}
	};


	const pickImage = async () => {
		props.onPickImage((res:any) => {
			if (res !== null) {
				const newData = JSON.parse(JSON.stringify(data)) as SpriteMapType;
				newData.image = res;
				setData(newData);
				props.onSetData(JSON.stringify(newData, null, 2), true);
			}
		});
	}


	// ########################################################################
	// Render
	// ########################################################################


	const imageStyle = {} as CSSProperties;
	imageStyle.transform = `translate(-30px, -30px) scale(${zoom})`;
	imageStyle.transformOrigin = 'top left';
	imageStyle.imageRendering = 'pixelated';


	const canZoomIn = zoom < 10;
	const canZoomOut = zoom > 1;


	const renderRects = () => {
		const result = [];
		if (aniObj) {
			const frameIndex = frames.indexOf(frame);
			for (const [i,fr] of aniObj.frames.entries()) {
				const p = (fr.coords ?? '0,0,0,0').split(',');
				if (p.length > 3) {
					const x = p[0].trim() + 'px';
					const y = p[1].trim() + 'px';
					const w = p[2].trim() + 'px';
					const h = p[3].trim() + 'px';
					const c_active = frameIndex == i ? 'is-active' : '';
					result.push(<span className={classList([c_active])} key={`frame${i}`} style={{left:x, top:y, width:w, height:h}}></span>)
				}
			}
		}
		return result;
	};

	return (
		<div className={[props.active?'tab-active':'tab-inactive'].join(' ')}>
			<div className='toolbar-container'>
				<TabToolbar>
					<div className="toolbar-group toolbar-fill">
						{/* <Button className="toolbar-button" disabled={true}><i className='icon-arrows-cw'></i></Button> */}
						<Button className="toolbar-button" disabled={!canZoomOut} onClick={() => updateZoom(zoom - 1)}><i className='icon-zoom-out'></i></Button>
						<Button className="toolbar-button" disabled={!canZoomIn} onClick={() => updateZoom(zoom + 1)}><i className='icon-zoom-in'></i></Button>
						<span className="toolbar-label">{`${zoom}x`}</span>
						<Button className="toolbar-button" disabled={false} onClick={() => pickImage()}><i className='icon-folder'></i></Button>
						<span className="toolbar-label" style={{fontWeight:'bold', paddingRight:0}}>Texture:</span>
						<span className="toolbar-label">{data?.image ?? 'No image set.'}</span>
					</div>
					<div className="toolbar-group toolbar-end">
						<ToggleButton className="toolbar-button" toggle={preview} onClick={() => setPreview(!preview)} />
					</div>
				</TabToolbar>
				<div className='sprite-map-editor'>
					<SpriteMapViewport>

						<div className='sprite-map-viewport-inner' style={{display:preview?'none':'block'}}>
							<div style={imageStyle}>
								<img ref={image} src={imageData} />
								{renderRects()}
							</div>
						</div>
						
						<div className='sprite-map-viewport-inner' style={{display:preview?'block':'none'}}>
							<div style={imageStyle}>
								<canvas ref={previewCanvas} width={25} height={25} />
							</div>
						</div>

					</SpriteMapViewport>
					<div className='sprite-map-options'>
						<GroupBox header='Sprite Groups'>
							<ListBox items={groups} value={group} onSelect={setGroup} />
							<div className="buttons">
								<Button className='button'>New</Button>
								<Button className='button'>Copy</Button>
								<Button className='button'>Rename</Button>
								<Button className='button'><i className="icon-cancel" /></Button>
							</div>
						</GroupBox>
						<GroupBox header='Frames'>
							<ListBox items={frames} value={frame} onSelect={setFrame} />
							<div className="buttons">
								<Button className='button'>New</Button>
								<Button className='button'><i className="icon-cancel" /></Button>
								<span className="button-spacer" />
								<Button className={classList(['button', playing ? '':'is-disabled'])} onClick={() => setPlaying(false)}><i className="icon-stop" /></Button>
								<Button className={classList(['button', playing ? 'is-disabled':''])} onClick={() => setPlaying(true)}><i className="icon-play" /></Button>
							</div>
						</GroupBox>
						<GroupBox header='Selected Frame'>
							<div style={{overflowX: 'auto', height: '100%'}}>
								<div className='sprite-map-option'>
									<span>Coords (x,y,w,h)</span>
									<div>
										<input className="input" type="text" value={frameObj.coords} onChange={(e:any) => updateFrame({ coords:e.target.value, delay:frameObj.delay, flip_x:frameObj.flip_x, flip_y:frameObj.flip_y })} />
									</div>
								</div>
								<div className='sprite-map-option'>
									<span>Frame Time (ms)</span>
									<div>
										<input className="input" type="number" value={frameObj.delay} min={10} max={9999} onChange={(e:any) => updateFrame({ coords:frameObj.coords, delay:e.target.value, flip_x:frameObj.flip_x, flip_y:frameObj.flip_y })} />
									</div>
								</div>
								<div className='sprite-map-option'>
									<span>Features</span>
									<div>
										<label>
											<input type="checkbox" checked={frameObj?.flip_x ?? false} onChange={(e:any) => updateFrame({ coords:frameObj.coords, delay:frameObj.delay, flip_x:e.target.checked, flip_y:frameObj.flip_y })} />
											<span>Flip X</span>
										</label>
										<label>
										<input type="checkbox" checked={frameObj?.flip_y ?? false} onChange={(e:any) => updateFrame({ coords:frameObj.coords, delay:frameObj.delay, flip_x:frameObj.flip_x, flip_y:e.target.checked })} />
											<span>Flip Y</span>
										</label>
									</div>
								</div>
							</div>
						</GroupBox>
					</div>
				</div>
			</div>
		</div>
	);
}