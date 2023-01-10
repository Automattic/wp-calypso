import 'calypso/state/ui/init';

export default function isBlazeEnabled( state ) {
	return !! state.currentUser?.user?.has_promote_widget || false;
}
