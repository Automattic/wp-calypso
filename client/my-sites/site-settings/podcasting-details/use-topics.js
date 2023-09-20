import { useTranslate } from 'i18n-calypso';

function useTopics() {
	const translate = useTranslate();

	// List from https://help.apple.com/itc/podcasts_connect/#/itc9267a2f12
	return [
		{
			key: 'Arts',
			label: translate( 'Arts', { context: 'podcasting category' } ),
			subtopics: [
				{
					key: 'Books',
					label: translate( 'Books', { context: 'podcasting category' } ),
				},
				{
					key: 'Design',
					label: translate( 'Design', { context: 'podcasting category' } ),
				},
				{
					key: 'Fashion & Beauty',
					label: translate( 'Fashion & Beauty', { context: 'podcasting category' } ),
				},
				{
					key: 'Food',
					label: translate( 'Food', { context: 'podcasting category' } ),
				},
				{
					key: 'Performing Arts',
					label: translate( 'Performing Arts', { context: 'podcasting category' } ),
				},
				{
					key: 'Visual Arts',
					label: translate( 'Visual Arts', { context: 'podcasting category' } ),
				},
			],
		},
		{
			key: 'Business',
			label: translate( 'Business', { context: 'podcasting category' } ),
			subtopics: [
				{
					key: 'Careers',
					label: translate( 'Careers', { context: 'podcasting category' } ),
				},
				{
					key: 'Entrepreneurship',
					label: translate( 'Entrepreneurship', { context: 'podcasting category' } ),
				},
				{
					key: 'Investing',
					label: translate( 'Investing', { context: 'podcasting category' } ),
				},
				{
					key: 'Management',
					label: translate( 'Management', { context: 'podcasting category' } ),
				},
				{
					key: 'Marketing',
					label: translate( 'Marketing', { context: 'podcasting category' } ),
				},
				{
					key: 'Non-Profit',
					label: translate( 'Non-Profit', { context: 'podcasting category' } ),
				},
			],
		},
		{
			key: 'Comedy',
			label: translate( 'Comedy', { context: 'podcasting category' } ),
			subtopics: [
				{
					key: 'Comedy Interviews',
					label: translate( 'Comedy Interviews', { context: 'podcasting category' } ),
				},
				{
					key: 'Improv',
					label: translate( 'Improv', { context: 'podcasting category' } ),
				},
				{
					key: 'Stand-Up',
					label: translate( 'Stand-Up', { context: 'podcasting category' } ),
				},
			],
		},
		{
			key: 'Education',
			label: translate( 'Education', { context: 'podcasting category' } ),
			subtopics: [
				{
					key: 'Courses',
					label: translate( 'Courses', { context: 'podcasting category' } ),
				},
				{
					key: 'How To',
					label: translate( 'How To', { context: 'podcasting category' } ),
				},
				{
					key: 'Language Learning',
					label: translate( 'Language Learning', { context: 'podcasting category' } ),
				},
				{
					key: 'Self-Improvement',
					label: translate( 'Self-Improvement', { context: 'podcasting category' } ),
				},
			],
		},
		{
			key: 'Fiction',
			label: translate( 'Fiction', { context: 'podcasting category' } ),
			subtopics: [
				{
					key: 'Comedy Fiction',
					label: translate( 'Comedy Fiction', { context: 'podcasting category' } ),
				},
				{
					key: 'Drama',
					label: translate( 'Drama', { context: 'podcasting category' } ),
				},
				{
					key: 'Science Fiction',
					label: translate( 'Science Fiction', { context: 'podcasting category' } ),
				},
			],
		},
		{
			key: 'Government',
			label: translate( 'Government', { context: 'podcasting category' } ),
			subtopics: [],
		},
		{
			key: 'History',
			label: translate( 'History', { context: 'podcasting category' } ),
			subtopics: [],
		},
		{
			key: 'Health & Fitness',
			label: translate( 'Health & Fitness', { context: 'podcasting category' } ),
			subtopics: [
				{
					key: 'Alternative Health',
					label: translate( 'Alternative Health', { context: 'podcasting category' } ),
				},
				{
					key: 'Fitness',
					label: translate( 'Fitness', { context: 'podcasting category' } ),
				},
				{
					key: 'Medicine',
					label: translate( 'Medicine', { context: 'podcasting category' } ),
				},
				{
					key: 'Mental Health',
					label: translate( 'Mental Health', { context: 'podcasting category' } ),
				},
				{
					key: 'Nutrition',
					label: translate( 'Nutrition', { context: 'podcasting category' } ),
				},
				{
					key: 'Sexuality',
					label: translate( 'Sexuality', { context: 'podcasting category' } ),
				},
			],
		},
		{
			key: 'Kids & Family',
			label: translate( 'Kids & Family', { context: 'podcasting category' } ),
			subtopics: [
				{
					key: 'Education for Kids',
					label: translate( 'Education for Kids', { context: 'podcasting category' } ),
				},
				{
					key: 'Parenting',
					label: translate( 'Parenting', { context: 'podcasting category' } ),
				},
				{
					key: 'Pets & Animals',
					label: translate( 'Pets & Animals', { context: 'podcasting category' } ),
				},
				{
					key: 'Stories for Kids',
					label: translate( 'Stories for Kids', { context: 'podcasting category' } ),
				},
			],
		},
		{
			key: 'Leisure',
			label: translate( 'Leisure', { context: 'podcasting category' } ),
			subtopics: [
				{
					key: 'Animation & Manga',
					label: translate( 'Animation & Manga', { context: 'podcasting category' } ),
				},
				{
					key: 'Automotive',
					label: translate( 'Automotive', { context: 'podcasting category' } ),
				},
				{
					key: 'Aviation',
					label: translate( 'Aviation', { context: 'podcasting category' } ),
				},
				{
					key: 'Crafts',
					label: translate( 'Crafts', { context: 'podcasting category' } ),
				},
				{
					key: 'Games',
					label: translate( 'Games', { context: 'podcasting category' } ),
				},
				{
					key: 'Hobbies',
					label: translate( 'Hobbies', { context: 'podcasting category' } ),
				},
				{
					key: 'Home & Garden',
					label: translate( 'Home & Garden', { context: 'podcasting category' } ),
				},
				{
					key: 'Video Games',
					label: translate( 'Video Games', { context: 'podcasting category' } ),
				},
			],
		},
		{
			key: 'Music',
			label: translate( 'Music', { context: 'podcasting category' } ),
			subtopics: [
				{
					key: 'Music Commentary',
					label: translate( 'Music Commentary', { context: 'podcasting category' } ),
				},
				{
					key: 'Music History',
					label: translate( 'Music History', { context: 'podcasting category' } ),
				},
				{
					key: 'Music Interviews',
					label: translate( 'Music Interviews', { context: 'podcasting category' } ),
				},
			],
		},
		{
			key: 'News',
			label: translate( 'News', { context: 'podcasting category' } ),
			subtopics: [
				{
					key: 'Business News',
					label: translate( 'Business News', { context: 'podcasting category' } ),
				},
				{
					key: 'Daily News',
					label: translate( 'Daily News', { context: 'podcasting category' } ),
				},
				{
					key: 'Entertainment News',
					label: translate( 'Entertainment News', { context: 'podcasting category' } ),
				},
				{
					key: 'News Commentary',
					label: translate( 'News Commentary', { context: 'podcasting category' } ),
				},
				{
					key: 'Politics',
					label: translate( 'Politics', { context: 'podcasting category' } ),
				},
				{
					key: 'Sports News',
					label: translate( 'Sports News', { context: 'podcasting category' } ),
				},
				{
					key: 'Tech News',
					label: translate( 'Tech News', { context: 'podcasting category' } ),
				},
			],
		},
		{
			key: 'Religion & Spirituality',
			label: translate( 'Religion & Spirituality', { context: 'podcasting category' } ),
			subtopics: [
				{
					key: 'Buddhism',
					label: translate( 'Buddhism', { context: 'podcasting category' } ),
				},
				{
					key: 'Christianity',
					label: translate( 'Christianity', { context: 'podcasting category' } ),
				},
				{
					key: 'Hinduism',
					label: translate( 'Hinduism', { context: 'podcasting category' } ),
				},
				{
					key: 'Islam',
					label: translate( 'Islam', { context: 'podcasting category' } ),
				},
				{
					key: 'Judaism',
					label: translate( 'Judaism', { context: 'podcasting category' } ),
				},
				{
					key: 'Religion',
					label: translate( 'Religion', { context: 'podcasting category' } ),
				},
				{
					key: 'Spirituality',
					label: translate( 'Spirituality', { context: 'podcasting category' } ),
				},
			],
		},
		{
			key: 'Science',
			label: translate( 'Science', { context: 'podcasting category' } ),
			subtopics: [
				{
					key: 'Astronomy',
					label: translate( 'Astronomy', { context: 'podcasting category' } ),
				},
				{
					key: 'Chemistry',
					label: translate( 'Chemistry', { context: 'podcasting category' } ),
				},
				{
					key: 'Earth Sciences',
					label: translate( 'Earth Sciences', { context: 'podcasting category' } ),
				},
				{
					key: 'Life Sciences',
					label: translate( 'Life Sciences', { context: 'podcasting category' } ),
				},
				{
					key: 'Mathematics',
					label: translate( 'Mathematics', { context: 'podcasting category' } ),
				},
				{
					key: 'Natural Sciences',
					label: translate( 'Natural Sciences', { context: 'podcasting category' } ),
				},
				{
					key: 'Nature',
					label: translate( 'Nature', { context: 'podcasting category' } ),
				},
				{
					key: 'Physics',
					label: translate( 'Physics', { context: 'podcasting category' } ),
				},
				{
					key: 'Social Sciences',
					label: translate( 'Social Sciences', { context: 'podcasting category' } ),
				},
			],
		},
		{
			key: 'Society & Culture',
			label: translate( 'Society & Culture', { context: 'podcasting category' } ),
			subtopics: [
				{
					key: 'Documentary',
					label: translate( 'Documentary', { context: 'podcasting category' } ),
				},
				{
					key: 'Personal Journals',
					label: translate( 'Personal Journals', { context: 'podcasting category' } ),
				},
				{
					key: 'Philosophy',
					label: translate( 'Philosophy', { context: 'podcasting category' } ),
				},
				{
					key: 'Places & Travel',
					label: translate( 'Places & Travel', { context: 'podcasting category' } ),
				},
				{
					key: 'Relationships',
					label: translate( 'Relationships', { context: 'podcasting category' } ),
				},
			],
		},
		{
			key: 'Sports',
			label: translate( 'Sports', { context: 'podcasting category' } ),
			subtopics: [
				{
					key: 'Baseball',
					label: translate( 'Baseball', { context: 'podcasting category' } ),
				},
				{
					key: 'Basketball',
					label: translate( 'Basketball', { context: 'podcasting category' } ),
				},
				{
					key: 'Cricket',
					label: translate( 'Cricket', { context: 'podcasting category' } ),
				},
				{
					key: 'Fantasy Sports',
					label: translate( 'Fantasy Sports', { context: 'podcasting category' } ),
				},
				{
					key: 'Football',
					label: translate( 'Football', { context: 'podcasting category' } ),
				},
				{
					key: 'Golf',
					label: translate( 'Golf', { context: 'podcasting category' } ),
				},
				{
					key: 'Hockey',
					label: translate( 'Hockey', { context: 'podcasting category' } ),
				},
				{
					key: 'Rugby',
					label: translate( 'Rugby', { context: 'podcasting category' } ),
				},
				{
					key: 'Running',
					label: translate( 'Running', { context: 'podcasting category' } ),
				},
				{
					key: 'Soccer',
					label: translate( 'Soccer', { context: 'podcasting category' } ),
				},
				{
					key: 'Swimming',
					label: translate( 'Swimming', { context: 'podcasting category' } ),
				},
				{
					key: 'Tennis',
					label: translate( 'Tennis', { context: 'podcasting category' } ),
				},
				{
					key: 'Volleyball',
					label: translate( 'Volleyball', { context: 'podcasting category' } ),
				},
				{
					key: 'Wilderness',
					label: translate( 'Wilderness', { context: 'podcasting category' } ),
				},
				{
					key: 'Wrestling',
					label: translate( 'Wrestling', { context: 'podcasting category' } ),
				},
			],
		},
		{
			key: 'Technology',
			label: translate( 'Technology', { context: 'podcasting category' } ),
			subtopics: [],
		},
		{
			key: 'True Crime',
			label: translate( 'True Crime', { context: 'podcasting category' } ),
			subtopics: [],
		},
		{
			key: 'TV & Film',
			label: translate( 'TV & Film', { context: 'podcasting category' } ),
			subtopics: [
				{
					key: 'After Shows',
					label: translate( 'After Shows', { context: 'podcasting category' } ),
				},
				{
					key: 'Film History',
					label: translate( 'Film History', { context: 'podcasting category' } ),
				},
				{
					key: 'Film Interviews',
					label: translate( 'Film Interviews', { context: 'podcasting category' } ),
				},
				{
					key: 'Film Reviews',
					label: translate( 'Film Reviews', { context: 'podcasting category' } ),
				},
				{
					key: 'TV Reviews',
					label: translate( 'TV Reviews', { context: 'podcasting category' } ),
				},
			],
		},
	];
}

export default useTopics;
