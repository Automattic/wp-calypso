import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { useSubscriptionManagerContext } from '../subscription-manager-context';

type LinkProps = Omit< RouterLinkProps, 'to' > &
	Omit< React.HTMLProps< HTMLAnchorElement >, 'ref' > & { active?: boolean };

const Link = ( { active = false, ...props }: LinkProps ) => {
	const { isSubscriptionsPortal } = useSubscriptionManagerContext();

	if ( active || isSubscriptionsPortal ) {
		return <RouterLink to={ props.href || '' } { ...props } />;
	}
	return <a { ...props }></a>;
};

export default Link;
