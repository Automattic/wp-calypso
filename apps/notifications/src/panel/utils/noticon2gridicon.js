import { getNoticonName } from '../../common/icon-map';

const gridicons = {
	mention: 'mention',
	comment: 'comment',
	add: 'add',
	info: 'info',
	lock: 'lock',
	stats: 'stats-alt',
	reblog: 'reblog',
	star: 'star',
	trophy: 'trophy',
	reply: 'reply',
	warning: 'warning',
	checkmark: 'checkmark',
	cart: 'cart',
};

const noticon2gridicon = ( c ) => gridicons[ getNoticonName( c ) ];

export default noticon2gridicon;
