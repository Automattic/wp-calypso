/* eslint-disable no-console */
import { useState } from 'react';
import SimplifiedSegmentedControl from './simplified';
import SegmentedControl from './';

export default {
	title: 'Unaudited/SegmentedControl',
	component: SegmentedControl,
	argTypes: {
		compact: { control: 'boolean' },
	},
};

export const Default = ( { compact } ) => {
	const [ selected, setSelected ] = useState( 'all' );
	const options = [
		{ value: 'all', label: 'All' },
		{ value: 'unread', label: 'Unread' },
		{ value: 'comments', label: 'Comments' },
		{ value: 'follows', label: 'Follows' },
		{ value: 'likes', label: 'Likes' },
	];
	const controlDemoStyles = { maxWidth: 386 };

	const selectChildSegment = ( childSelected, event ) => {
		event.preventDefault();
		setSelected( childSelected );
		console.log( 'Segmented Control (selected):', childSelected );
	};

	const selectSegment = ( option ) => {
		console.log( 'Segmented Control (selected):', option );
	};

	return (
		<div>
			<h3>Items passed as options prop</h3>

			<SimplifiedSegmentedControl
				options={ options }
				onSelect={ selectSegment }
				style={ controlDemoStyles }
				compact={ compact }
			/>

			<h3 style={ { marginTop: 20 } }>Primary version</h3>

			<SegmentedControl
				selectedText={ selected }
				style={ controlDemoStyles }
				primary
				compact={ compact }
			>
				<SegmentedControl.Item
					selected={ selected === 'all' }
					onClick={ selectChildSegment.bind( this, 'all' ) }
				>
					All
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ selected === 'unread' }
					onClick={ selectChildSegment.bind( this, 'unread' ) }
				>
					Unread
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ selected === 'comments' }
					onClick={ selectChildSegment.bind( this, 'comments' ) }
				>
					Comments
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ selected === 'follows' }
					onClick={ selectChildSegment.bind( this, 'follows' ) }
				>
					Follows
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ selected === 'likes' }
					onClick={ selectChildSegment.bind( this, 'likes' ) }
				>
					Likes
				</SegmentedControl.Item>
			</SegmentedControl>
		</div>
	);
};
