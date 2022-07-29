import config from '@automattic/calypso-config';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import megaphoneIllustration from 'calypso/assets/images/customer-home/illustration--megaphone.svg';
import { loadDSPWidgetJS, showDSPWidgetModal } from 'calypso/lib/promote-post';
import { TASK_PROMOTE_POST } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const PromotePost = () => {
	const [ isLoading, setIsLoading ] = useState( false );

	const translate = useTranslate();
	const showPromotePost = config.isEnabled( 'promote-post' );

	const selectedSiteId = useSelector( getSelectedSiteId );

	const showDSPWidget = async () => {
		if ( isLoading ) {
			return;
		}
		setIsLoading( true );
		await showDSPWidgetModal( selectedSiteId );
		setIsLoading( false );
	};

	useEffect( () => {
		loadDSPWidgetJS();
	} );

	return (
		<>
			{ showPromotePost && (
				<Task
					title={ translate( 'Promote your posts' ) }
					description={ translate(
						'Reach more people promoting a post to the larger WordPress.com community of blogs and sites with our ad delivery system.'
					) }
					actionText={ isLoading ? <Spinner /> : translate( 'Promote a post' ) }
					actionOnClick={ showDSPWidget }
					completeOnStart={ false }
					illustration={ megaphoneIllustration }
					taskId={ TASK_PROMOTE_POST }
				/>
			) }
		</>
	);
};

export default PromotePost;
