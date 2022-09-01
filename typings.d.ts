export interface Post {
    _id: string,
    _createdAt: string,
    title: string,
    author: {
        name: string,
        image: string,
    },
    description: string,
    mainImage: {
        asset: {
            url: string
        }
    }
    slug: {
        current: string
    },
    body: object[],
    comments: Comment[]
}

export interface Comment {
    _id: string,
    _createdAt: string,
    _rev: string,
    _type: string,
    _createdAt: string,
    name: string,
    email: string,
    comment: string,
    approved: boolean,
    post: {
        _type: string,
        _ref: string
    }
}
