import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import {
	useSubscriptionManagerContext,
	SubscriptionsPortal,
} from '../subscription-manager-context';

type LinkProps = Omit< RouterLinkProps, 'to' > &
	Omit< React.HTMLProps< HTMLAnchorElement >, 'ref' > & { active?: boolean };

const Link = ( { active = false, ...props }: LinkProps ) => {
	const { portal } = useSubscriptionManagerContext();

	if ( active || portal === SubscriptionsPortal ) {
		return <RouterLink to={ props.href || '' } { ...props } />;
	}
	return <a { ...props }></a>;
};

export default Link;
