import { useTranslate } from 'i18n-calypso';

export default function useAddNewSiteTour() {
	const translate = useTranslate();

	return [
		{
			id: 'add-new-site',
			popoverPosition: 'bottom left',
			title: translate( 'Manage all your agency’s sites' ),
			description: (
				<>
					{ translate(
						'The Add sites menu is your hub. Add sites you manage or create new ones. All sites will show in this site management view.'
					) }
				</>
			),
			nextStepOnTargetClick: true,
			forceShowSkipButton: true,
		},
	];
}
