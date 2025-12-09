import { EmptyView, Suggestion } from '@automattic/agenttic-ui';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import BigSkyIcon from '../big-sky-icon';
import { AI } from '../icons';

export default function CustomEmptyView( {
	isDocked,
	emptyViewSuggestions,
}: {
	isDocked: boolean;
	emptyViewSuggestions: Suggestion[];
} ) {
	const navigate = useNavigate();
	return (
		<>
			<Button variant="link" onClick={ () => navigate( -1 ) }>
				Back
			</Button>
			<EmptyView
				heading={ __( 'Howdy! How can I help you today?', '__i18n_text_domain__' ) }
				help={ __( 'Got a different request? Ask away.', '__i18n_text_domain__' ) }
				suggestions={ emptyViewSuggestions }
				icon={ isDocked ? <AI /> : <BigSkyIcon width={ 64 } height={ 64 } /> }
			/>
		</>
	);
}
