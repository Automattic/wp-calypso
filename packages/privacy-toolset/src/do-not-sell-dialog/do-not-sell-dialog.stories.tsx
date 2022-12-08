import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';
import React, { useState } from 'react';
import { DoNotSellDialog } from '.';
import type { DoNotSellDialogProps } from '.';

export default {
	title: 'Do Not Sell Dialog',
};

export const Default: Story< DoNotSellDialogProps > = ( args ) => {
	const [ isActive, setActive ] = useState( false );
	return <DoNotSellDialog { ...args } isActive={ isActive } onToggleActive={ setActive } />;
};

Default.args = {
	content: {
		title: 'Do Not Sell or Share My Data',
		longDescription: (
			<>
				<p>
					Sed placerat, orci ullamcorper varius interdum, diam lectus vestibulum lacus, at varius
					nunc ipsum quis orci. Ut dui libero, ornare at luctus ac, bibendum sit amet risus. Donec
					tempus nisl nec arcu feugiat, sit amet fermentum velit varius. Nam sed malesuada enim, eu
					lobortis neque. Cras metus diam, sollicitudin non diam eu, bibendum tempor eros. Donec
					vehicula venenatis nunc semper pharetra. Nunc tristique nisl id tristique dictum.
				</p>
				<p>
					Sed auctor est nec luctus egestas. Sed tincidunt auctor fringilla. In eleifend diam sed
					egestas semper. Donec vitae condimentum urna. Morbi non consectetur purus. Etiam faucibus,
					nunc id laoreet dapibus, arcu nisi sollicitudin turpis, sit amet iaculis lacus nulla eget
					magna. Suspendisse sed iaculis erat. Duis sed sem vitae velit pharetra convallis elementum
					vitae nibh. Proin ornare nunc pellentesque posuere ultrices. Fusce lacinia ligula id
					condimentum semper. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
					viverra fringilla vehicula.
				</p>
				<p>
					Aenean euismod, sem id tincidunt aliquet, augue ipsum dignissim dui, finibus pretium
					tellus massa sit amet ipsum. Aliquam auctor magna et dui feugiat, et imperdiet enim
					cursus. Donec at nulla id dolor pharetra rutrum. Vivamus ornare, massa ac finibus laoreet,
					neque turpis vulputate ante, a fringilla felis ante a lectus. Suspendisse pulvinar nisi
					eget est laoreet, a maximus velit finibus. Ut sed venenatis justo. Proin lobortis feugiat
					aliquam. Aliquam sem velit, tempus vel scelerisque sit amet, suscipit a tellus. Nullam a
					tellus eros. Quisque ac fermentum felis. Nam sagittis finibus erat.
				</p>
			</>
		),
		toggleLabel: 'Do Not Sell or Share My Data',
		closeButton: 'Close',
	},
	onClose: action( 'Close' ),
};
