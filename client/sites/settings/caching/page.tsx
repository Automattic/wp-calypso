import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import { useAreHostingFeaturesSupported } from 'calypso/sites/features';
import CacheForm from './form';

function Container( { children }: { children: React.ReactNode } ) {
	return children;
}

function Description( { children }: { children?: React.ReactNode } ) {
	const translate = useTranslate();
	return <NavigationHeader title={ translate( 'Caching' ) } subtitle={ children } />;
}

function Subdescription( { children }: { children?: React.ReactNode } ) {
	return <div>{ children }</div>;
}

export default function CachingSettings() {
	const translate = useTranslate();
	const isSupported = useAreHostingFeaturesSupported();

	const renderNotSupportedNotice = () => {
		return (
			<>
				<Description />
				<Notice showDismiss={ false } status="is-warning">
					{ translate( 'This setting is not supported for this site.' ) }
				</Notice>
			</>
		);
	};

	const renderSetting = () => {
		return (
			<CacheForm
				ContainerComponent={ Container }
				DescriptionComponent={ Description }
				SubdescriptionComponent={ Subdescription }
			/>
		);
	};

	return (
		<div className="tools-caching">
			{ isSupported ? renderSetting() : renderNotSupportedNotice() }
		</div>
	);
}
