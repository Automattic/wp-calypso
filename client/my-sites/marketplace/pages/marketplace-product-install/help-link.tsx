import { useTranslate } from 'i18n-calypso';
import { useShowHelpCenter } from 'calypso/components/help-center';

export default function MarketplaceInstallHelpLink() {
	const translate = useTranslate();
	const { setShowHelpCenter } = useShowHelpCenter();

	return (
		<p className="marketplace-plugin-install__help">
			{ translate( 'Something wrong? {{link}}Contact us{{/link}}', {
				components: {
					link: (
						<a
							href="/help/contact"
							onClick={ ( event ) => {
								event.preventDefault();
								setShowHelpCenter( true );
							} }
						/>
					),
				},
			} ) }
		</p>
	);
}
