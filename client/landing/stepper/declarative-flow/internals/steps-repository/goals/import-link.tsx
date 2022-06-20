import { Button } from '@automattic/components';
import { Tooltip } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSite } from '../../../../hooks/use-site';
import './import-link.scss';

type ImportLinkProps = {
	busy: boolean;
	onClick: () => void;
};

export const ImportLink = ( { busy, onClick }: ImportLinkProps ) => {
	const site = useSite();
	const canImport = Boolean( site?.capabilities?.manage_options );

	const translate = useTranslate();

	const importDisableText = translate(
		"You're not authorized to import content.{{br/}}Please check with your site admin.",
		{
			components: {
				br: <br />,
			},
		}
	);

	return (
		<div className="import-link__container">
			<p className="import-link__description">
				{ translate( 'Already have an existing website?' ) }
			</p>
			<Button
				disabled={ ! canImport }
				className="import-link__button"
				busy={ busy }
				onClick={ onClick }
			>
				{ translate( 'Import your site content' ) }
			</Button>
			{ ! canImport && (
				<>
					&nbsp;
					<Tooltip text={ importDisableText } position="bottom center">
						<div className="import-link__disabled-info">
							<Icon icon={ info } size={ 20 } />
						</div>
					</Tooltip>
				</>
			) }
		</div>
	);
};

export default ImportLink;
