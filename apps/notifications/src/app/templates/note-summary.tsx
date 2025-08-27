import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { html } from '../../panel/indices-to-html';
import noticon2gridicon from '../../panel/utils/noticon2gridicon';
import Gridicon from './gridicons';
import NoteIcon from './note-icon';
import type { Note } from '../types';

const NoteSummary = ( { note }: { note: Note } ) => {
	return (
		<HStack justify="flex-start" spacing={ 4 }>
			<div style={ { position: 'relative', flexShrink: 0 } }>
				<div style={ { width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden' } }>
					<NoteIcon icon={ note.icon } size={ 32 } />
				</div>
				<span
					className="wpnc__gridicon"
					style={ {
						position: 'absolute',
						bottom: '-5px',
						right: '-8px',
						width: '16px',
						height: '16px',
						border: '1px solid #fff',
						borderRadius: '50%',
						background: '#ddd',
					} }
				>
					<Gridicon icon={ noticon2gridicon( note.noticon ) } size={ 16 } />
				</span>
			</div>
			<VStack className="wpnc__text-summary">
				<div
					className="wpnc__subject"
					style={ { whiteSpace: 'pre-wrap' } }
					/* eslint-disable-next-line react/no-danger */
					dangerouslySetInnerHTML={ {
						__html: html( note.subject[ 0 ], {
							links: false,
						} ),
					} }
				/>
			</VStack>
		</HStack>
	);
};

export default NoteSummary;
