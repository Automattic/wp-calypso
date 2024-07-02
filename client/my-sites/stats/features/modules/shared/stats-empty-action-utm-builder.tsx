import { trendingUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import EmptyStateAction from '../../../components/empty-state-action';

type StatsEmptyActionUTMBuilderProps = {
	from: string;
	onClick: () => void;
};

const StatsEmptyActionUTMBuilder: React.FC< StatsEmptyActionUTMBuilderProps > = ( {
	from,
	onClick,
} ) => {
	const translate = useTranslate();
	return (
		<EmptyStateAction
			icon={ trendingUp }
			text={ translate( 'Generate URL with codes using our builder' ) }
			analyticsDetails={ {
				from: from,
				feature: 'utm_builder',
			} }
			onClick={ () => {
				// analytics event tracting handled in EmptyStateAction component

				onClick();
			} }
		/>
	);
};

export default StatsEmptyActionUTMBuilder;
