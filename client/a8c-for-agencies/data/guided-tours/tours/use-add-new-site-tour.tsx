import { useTranslate } from 'i18n-calypso';

export default function useAddNewSiteTour() {
	const translate = useTranslate();

	return [
		{
			id: 'add-new-site',
			popoverPosition: 'bottom left',
			title: translate( 'Click the arrow button' ),
			description: (
				<>
					{ translate( 'Click the arrow button and select "Connect a site to Jetpack".' ) }
					<br />
					<br />
					{ translate(
						'Sites with Jetpack installed will automatically appear in the site management view.'
					) }
				</>
			),
			nextStepOnTargetClick: true,
			forceShowSkipButton: true,
		},
	];
}
