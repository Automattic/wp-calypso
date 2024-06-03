import { Button, Card } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FunctionComponent, ReactNode, Fragment } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

interface Props {
	bodyText: TranslateResult | ReactNode;
	buttonLink?: TranslateResult;
	buttonText?: TranslateResult;
	headerText: TranslateResult;
	iconComponent?: ReactNode;
	onClick?: () => void;
}

const JetpackSearchContent: FunctionComponent< Props > = ( {
	bodyText,
	buttonLink,
	buttonText,
	headerText,
	iconComponent,
	onClick,
} ) => {
	const translate = useTranslate();

	return (
		<Fragment>
			{ ! isJetpackCloud() && (
				<FormattedHeader
					headerText={ translate( 'Jetpack Search' ) }
					id="jetpack-search-header"
					align="left"
					brandFont
				/>
			) }
			<Card>
				<div className="jetpack-search__content">
					<div className="jetpack-search__logo">{ iconComponent }</div>
					<h2
						className={ clsx( 'jetpack-search__header', {
							'wp-brand-font': ! isJetpackCloud(),
						} ) }
					>
						{ headerText }
					</h2>
					<p>{ bodyText }</p>
					<Button
						primary
						className="jetpack-search__button"
						href={ buttonLink as string }
						onClick={ onClick || undefined }
					>
						{ buttonText }
					</Button>
				</div>
			</Card>
		</Fragment>
	);
};

export default JetpackSearchContent;
