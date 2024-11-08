import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';

const HundredYearDomainNotTransferrableNotice = () => {
	const translate = useTranslate();

	const text = translate( 'This is a 100-year domain and cannot be transferred.' );

	return <Notice text={ text } status="is-warning" showDismiss={ false } />;
};

export default HundredYearDomainNotTransferrableNotice;
