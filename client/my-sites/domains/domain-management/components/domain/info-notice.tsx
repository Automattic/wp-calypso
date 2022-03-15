/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Icon, info } from '@wordpress/icons';
import Notice from 'calypso/components/notice';

const InfoNotice = ( { redesigned = false, text }: { redesigned: boolean; text: string } ) => {
	return ! redesigned ? (
		<Notice status="is-warning" showDismiss={ false } text={ text } />
	) : (
		<div className="info-card">
			<Icon icon={ info } size={ 18 } className="info-card__icon gridicon" viewBox="2 2 20 20" />
			<div className="info-card__message">{ text }</div>
		</div>
	);
};

export default InfoNotice;
