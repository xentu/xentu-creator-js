import React, { useEffect, useState, useContext } from 'react';
import { SettingsContext } from '../Context/SettingsManager';

type ComponentProps = {
	guid: string,
	filePath:string,
	active: boolean,
	labelChanged: Function, 
	onSetData: Function
};

export default function TabConversationEditor(props: ComponentProps) {
	const [data, setData] = useState('');
	const settings = useContext(SettingsContext);
	return (
		<div className={[props.active?'tab-active':'tab-inactive'].join(' ')}>
			<div className='toolbar-container'>
				<div className='image-viewer'>
					<div className='tab-placeholder'>
						Not Yet Implemented (Conversation Editor)
					</div>
				</div>
			</div>
		</div>
	);
}