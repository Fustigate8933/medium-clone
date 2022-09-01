export default {
    name: 'comment',
    title: 'Comment',
    type: 'document',
    fields: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'email',
        type: 'string',
      },
      {
        name: 'comment',
        type: "text",
      },
      {
        name: "post",
        type: "reference",
        to: [{type: "post"}]
      },
      {
        name: "approved",
        title: "Approved",
        type: "boolean",
        description: "Comments won't show up without approval",
      }
    ]
}
  