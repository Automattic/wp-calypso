import { useTranslate } from 'i18n-calypso';
import GuidedTour from 'calypso/jetpack-cloud/components/guided-tour';
import { JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME } from '../constants';

import '../style.scss';

interface Props {
	isLoading: boolean;
	pluginCount: number;
}

export default function PluginOverviewTour( { isLoading, pluginCount }: Props ) {
	const translate = useTranslate();
	const urlParams = new URLSearchParams( window.location.search );
	const shouldRenderPluginManagementTour =
		urlParams.get( 'tour' ) === 'plugin-management' && ! isLoading && pluginCount > 0;

	return (
		shouldRenderPluginManagementTour && (
			<GuidedTour
				className="onboarding-tours__guided-tour"
				preferenceName={ JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME[ 'pluginOverview' ] }
				redirectAfterTourEnds="/overview"
				tours={ [
					{
						target: '#plugin-management-v2__installed-plugins-table-header',
						popoverPosition: 'bottom right',
						title: translate( 'Plugins overview' ),
						description: translate(
							'Here you can see all installed plugins across all of your sites.'
						),
					},
					{
						target: '#plugin-management-v2__edit-all-button',
						popoverPosition: 'bottom left',
						title: translate( 'Select to edit all plugins' ),
						description: translate( 'You can manage all of your plugins at once.' ),
						nextStepOnTargetClick: '#plugin-management-v2__edit-all-button',
					},
					{
						target: '#plugin-list-header__buttons-autoupdate-button',
						popoverPosition: 'bottom left',
						title: translate( 'Bulk management options' ),
						description: translate(
							'Here you can activate or deactivate all of your plugins, set them to autoupdate or disable it entirely.'
						),
					},
					{
						target: '#plugin-list-header__buttons-update-button',
						popoverPosition: 'bottom left',
						title: translate( 'All plugins update' ),
						description: translate(
							'You can update all your out-of-date plugins with the auto-update feature.'
						),
					},
				] }
			/>
		)
	);
}
