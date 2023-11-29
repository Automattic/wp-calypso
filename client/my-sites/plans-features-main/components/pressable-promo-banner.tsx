import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

const PressablePromoBanner = () => {
	const translate = useTranslate();
	const onClick = () => {};

	return (
		<div>
			<div>Pressable Logo here</div>
			<div>
				<h4>{ translate( 'Hosting partner' ) }</h4>
				<h2>{ translate( 'Multi-Site Hosting by Pressable' ) }</h2>
				<p>
					{ translate(
						'Looking to manage multiple websites with ease? Discover the power of Pressable Multi-Site Hosting. Ideal for agencies and web professionals. '
					) }
				</p>
			</div>
			<div>
				<Button
					href="https://pressable.com/pricing/?utm_source=referral&utm_medium=wpdotcom&utm_campaign=pricing"
					onClick={ onClick }
					target="_blank"
					primary
				>
					{ translate( 'See Pressable Plans' ) }
					<Gridicon icon="external" />
				</Button>
			</div>
		</div>
	);
};

export default PressablePromoBanner;
