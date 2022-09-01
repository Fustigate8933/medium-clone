import React from 'react'
import { useState } from "react"
import { sanityClient, urlFor } from '../../sanity'
import { GetStaticProps } from "next"
import PortableText from "react-portable-text"
import { useForm, SubmitHandler } from "react-hook-form"

interface Props{
    post: Post
}

interface IFormInput{
    _id: string,
    name: string,
    email: string,
    comment: string
}

function Post({ post }: Props) {
    const [submitted, setSubmitted] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>();

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        await fetch("/api/createComment", {
            method: "POST",
            body: JSON.stringify(data),
        }).then(() => {
            console.log("Data posted.", data)
            setSubmitted(true)
        }).catch(error => {
            console.log("error", error)
            setSubmitted(false)
        })
    }

    return (
        <main>
            <img className="w-full h-40 object-stretch" src={urlFor(post.mainImage).url()} alt="" />
            <article className="max-w-3xl mx-auto p-5 md:p-0">
                <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
                <h2 className="text-xl font-light text-gray-500 mb-2">{post.description}</h2>
                <div className="flex items-center space-x-2">
                    <img className="w-10 h-10 rounded-full" src={urlFor(post.author.image).url()!} alt="" />
                    <p className="font-extralight text-sm">
                        Blog post by <span className="text-blue-600">{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}
                    </p>
                </div>
                <div>
                    <PortableText
                        className=""
                        dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
                        projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
                        content={post.body}
                        serializers={
                            {
                                h1: (props: any) => (
                                    <h1 className="text-2xl font-bold my-5" {...props} />
                                ),
                                h2: (props: any) => (
                                    <h2 className="text-xl font-bold my-5" {...props} />
                                ),
                                li: ({ children }: any) => (
                                    <li className="ml-4 list-disc">{children}</li>
                                ),
                                link: ({ href, children }: any) => (
                                    <a href={href} className="text-blue-500 hover:underline">
                                        {children}
                                    </a>
                                )
                            }
                        }
                    />
                </div>
            </article>
            <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />
            {submitted ? 
            <div className="flex flex-col py-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto items-center">
                <h3 className="text-3xl font-bold">Thanks for submitting!</h3>
                <p>The comment will show after approval!</p>
            </div>
            : <form className="flex flex-col p-5 max-w-2xl mx-auto mb-10" onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-sm text-yellow-500">Enjoyed the article?</h3>
                <h3 className='text-3xl font-bold'>Leave a comment below!</h3>
                <hr className="py-3 mt-2" />

                <input {...register("_id")} type="hidden" name="_id" value={post._id}  />

                <span className="text-gray-700">Name</span>
                <label className="block mb-5">
                    <input {...register("name", {required: true})}className="shadow border rounded px-3 py-2 form-input mt-1 block w-full focus:ring ring-yellow-500 outline-none" placeholder="Johnny Appleseed" type="text" />
                </label>
                <span className="text-gray-700">Email</span>
                <label className="block mb-5">
                    <input {...register("email", {required: true})}className="shadow border rounded px-3 py-2 form-input mt-1 block w-full focus:ring ring-yellow-500 outline-none" placeholder="abcdefg@abcdefg.com" type="email" />
                </label>
                <span className="text-gray-700">Comment</span>
                <label className="block mb-5">
                    <textarea {...register("comment", {required: true})}className="shadow border rounded px-3 py-2 form-textarea mt-1 block w-full focus:ring ring-yellow-500 outline-none" placeholder="This post is really epic!" rows={5} />
                </label>
                {/* erros will return when field validation fails. (e.g. required fields not filled in) */}
                <div className="flex flex-col p-5">
                    {errors.name && <span className="text-red-500">Name is required.</span>}
                    {errors.email && <span className="text-red-500">Email is required.</span>}
                    {errors.comment && <span className="text-red-500">Comment is required.</span>}
                </div>

                <input className="shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer " type="submit" />
            </form>}

            <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500 shadow space-y-2">
                <h3 className="text-4xl">Comments</h3>
                <hr className="pb-2" />
                {post.comments.map((comment) => (
                    <div key={comment._id}>
                        <p><span className="text-yellow-500">{comment.name}:</span> {comment.comment}</p>
                    </div>
                ))}
            </div>
        </main>
    )
}

export default Post

export const getStaticPaths = async() => {
    const query = `
        *[_type == "post"]{
            _id,
            slug{
                current
            }
        }
    `
    const posts = await sanityClient.fetch(query)
    const paths = posts.map((post: Post) => ({
        params: {
            slug: post.slug.current
        }
    }))

    return {
        paths,
        fallback: "blocking"
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const query = `
        *[_type == "post" && slug.current == $slug][0]{
            _id,
            title,
            _createdAt,
            slug,
            author -> {
                name,
                image
            },
            "comments": *[
                _type == "comment" && post._ref == ^._id &&
                approved == true
            ],
            description,
            mainImage,
            body 
        }
    `

    const post = await sanityClient.fetch(query, {
        slug: params?.slug
    })

    if (!post){
        return {
            notFound: true
        }
    }

    return {
        props:{
            post
        },
        revalidate: 60
    }
}
