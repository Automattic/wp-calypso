import { Button, Card } from '@automattic/components';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FunctionComponent, ReactNode, Fragment } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';

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
			<FormattedHeader
				headerText={ translate( 'Jetpack Search' ) }
				id="jetpack-search-header"
				align="left"
				brandFont
			/>
			<Card>
				<div className="jetpack-search__content">
					{ iconComponent }
					{ headerText && <h1 className="jetpack-search__header">{ headerText }</h1> }
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
