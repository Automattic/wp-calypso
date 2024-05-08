import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import './style.scss';

const BaseBanner = ( {
	bannerTitle,
	bannerText,
	bannerClass,
	buttonIsLink,
	bannerButtonOnClick,
	bannerButtonText,
	secondaryButton,
	children,
}: {
	bannerTitle: string;
	bannerText: string;
	bannerClass: string;
	buttonIsLink?: boolean;
	bannerButtonOnClick?: () => void;
	bannerButtonText?: string;
	secondaryButton?: React.ReactNode;
	children?: React.ReactNode;
} ) => {
	return (
		<div className={ clsx( 'woocommerce-customize-store-banner', bannerClass ) }>
			<div className="woocommerce-customize-store-banner-content">
				<div className="banner-actions">
					<h1>{ bannerTitle }</h1>
					<p>{ bannerText }</p>
					{ bannerButtonText && (
						<Button
							onClick={ () => bannerButtonOnClick && bannerButtonOnClick() }
							variant={ buttonIsLink ? 'link' : 'primary' }
						>
							{ bannerButtonText }
						</Button>
					) }
					{ secondaryButton }
					<p className="ai-disclaimer">
						{ createInterpolateElement(
							__( 'Powered by experimental AI. <link>Learn more</link>' ),
							{
								link: (
									<Button
										href="https://automattic.com/ai-guidelines"
										variant="link"
										target="_blank"
										type="external"
									/>
								),
							}
						) }
					</p>
				</div>
				{ children }
			</div>
		</div>
	);
};

const WooDesignWithAIBanner = ( {
	onClick,
	className = '',
}: {
	onClick: () => void;
	className?: string;
} ) => {
	return (
		<BaseBanner
			bannerTitle={ __( 'Use the power of AI to create your store' ) }
			bannerText={ __(
				'Design the look of your store, create pages, and generate copy using our built-in AI tools.'
			) }
			bannerClass={ className }
			buttonIsLink={ false }
			bannerButtonOnClick={ onClick }
			bannerButtonText={ __( 'Design with AI' ) }
		/>
	);
};

export default WooDesignWithAIBanner;
