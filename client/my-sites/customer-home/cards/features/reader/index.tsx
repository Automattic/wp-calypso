import { useTranslate } from 'i18n-calypso';
import iconReaderLightbulb from 'calypso/assets/images/customer-home/reader-lightbulb.svg';
import { trackScrollPage } from 'calypso/reader/controller-helper';
import Stream from 'calypso/reader/stream';

import './style.scss';

const ReaderCard = () => {
	const translate = useTranslate();

	return (
		<>
			<div className="reader-card customer-home__card">
				<div className="reader-card__header">
					<h2 className="reader-card__title">
						<div className="reader-card__title-icon">
							<img src={ iconReaderLightbulb } alt="" />
						</div>
						<span>{ translate( 'Increase Views by Engaging with Others' ) }</span>
					</h2>
					<span className="reader-card__subtitle">
						{ translate(
							'You have more chances to pomp up your views when joining new conversations.'
						) }
					</span>
				</div>
				<Stream
					streamKey="discover:recommended--dailyprompt"
					trackScrollPage={ trackScrollPage.bind( null ) }
					useCompactCards={ true }
					isDiscoverStream={ true }
					suppressSiteNameLink={ true }
				/>
			</div>
		</>
	);
};

export default ReaderCard;
