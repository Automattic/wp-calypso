import { StepContainer } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import WebPreview from 'calypso/components/web-preview/component';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PreviewToolbar from 'calypso/signup/steps/design-picker/preview-toolbar';
import type { Step } from '../../types';
import './style.scss';

function PlaceHolderChecklist() {
	return (
		<ul style={ { textAlign: 'center' } }>
			<li>Item 1</li>
			<li>Item 2</li>
			<li>Item 3</li>
			<li>Item 4</li>
		</ul>
	);
}

function PlaceHolderPreview( { hostName } ) {
	const PreviewWrapper = styled.div`
		height: 700px;
	`;

	return (
		<PreviewWrapper>
			<WebPreview
				class="home-web-prev"
				showDeviceSwitcher={ true }
				showPreview
				showSEO={ true }
				isContentOnly
				externalUrl={ hostName }
				previewUrl={ 'https://' + hostName + '/?demo=true&iframe=true&theme_preview=true' }
				toolbarComponent={ PreviewToolbar }
				showClose={ false }
				showEdit={ false }
				showExternal={ false }
				loadingMessage={ '{{strong}}One moment, please…{{/strong}} loading your site.' }
			/>
		</PreviewWrapper>
	);
}

const Launchpad: Step = ( { navigation } ) => {
	const translate = useTranslate();
	const almostReadyToLaunchText = translate( 'Almost ready to launch' );
	const hostName = useQuery().get( 'siteSlug' );

	const stepContent = ( hostName ) => {
		return (
			<div className="launchpad__content">
				<PlaceHolderChecklist />
				<PlaceHolderPreview hostName={ hostName } />
			</div>
		);
	};

	return (
		<>
			<DocumentHead title={ almostReadyToLaunchText } />
			<StepContainer
				stepName={ 'launchpad' }
				goNext={ navigation.goNext }
				isWideLayout={ true }
				skipLabelText={ translate( 'Go to Admin' ) }
				skipButtonAlign={ 'top' }
				hideBack={ true }
				stepContent={ stepContent( hostName ) }
				formattedHeader={
					<FormattedHeader
						id={ 'launchpad-header' }
						headerText={ <>{ almostReadyToLaunchText }</> }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default Launchpad;
