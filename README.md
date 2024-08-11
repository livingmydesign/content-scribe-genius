# Welcome to your GPT Engineer project

## Project info

**Project**: content-scribe-genius 

**URL**: https://run.gptengineer.app/projects/65481ab7-e19b-4178-b178-a2c61a6160b7/improve

**Description**: please create a content genaration app that shows for input fields:
'news': multi line text input (3 rows + scrollable when longer than 3 rows of inputed text)
'get news': a button right besides the news-field of the same height as the news-field, when pressed sets a get_news boolean to true in the call of the webhook
'personal': single line text input
'controversial': single line text input
'inspiring': single line text input

and a 'generate'-button, when pressed calls the webhook 
https://hook.eu1.make.com/7hok9kqjre31fea5p7yi9ialusmbvlkc
as a PUT with a json body of the following structure:

{
    "news": "[text from the 'news'-input field]",
    "get_news": [true or false boolean depending on if the 'get_news'-button (true)or if any other button was pressed (false)],
    "generate_image": [true or false boolean depending on if the 'generate_image'-button (true) or if any other button was pressed (false)],
    "re-generate": [true or false boolean depending on if the 're-generate'-button (true) or if any other button was pressed (false)],
    "post_linkedin": [true or false boolean depending on if the 'post on linkedIn'-button (true) or if any other button was pressed (false)],
    "draft": "[text from last 'result_text'-return, if already existing or empty if no 'result_text' was yet returned]",
   "image": [image data of the uploaded image if an image upload process was successfully executed],
   "file_name": [file name of the uploaded image if an image upload process was successfully executed],

    "personal": "[text from the 'personal'-input field]",
    "controversial": "[text from the 'controversial'-input field]",
    "inspiring": "[text from the 'inspiring'-input field]"
}

wait for up to 30 seconds for the return value of the webhook in the successful (200)-format 
{"result_text":"[resulting generated text in markdown format]", "result_image":"[empty or url of the post image]"} or error-details on a (40x)-return if not successful.

the result-text should then be shown as markdown text with 3 buttons in a row below when the result-text is not empty:
a 're-generate': another webhook call with the 're-generate'-boolean as true
a 'post on linkedIn': another webhook call with the 'post_linkedin'-boolean as true
a 'generate image': another webhook call with the 'generate_image'-boolean as true
a 'upload image' -> triggers an image upload dialog 

## Who is the owner of this repository?
By default, GPT Engineer projects are created with public GitHub repositories.

However, you can easily transfer the repository to your own GitHub account by navigating to your [GPT Engineer project](https://run.gptengineer.app/projects/65481ab7-e19b-4178-b178-a2c61a6160b7/improve) and selecting Settings -> GitHub. 

## How can I edit this code?
There are several ways of editing your application.

**Use GPT Engineer**

Simply visit the GPT Engineer project at [GPT Engineer](https://run.gptengineer.app/projects/65481ab7-e19b-4178-b178-a2c61a6160b7/improve) and start prompting.

Changes made via gptengineer.app will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in the GPT Engineer UI.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps: 

```sh
git clone https://github.com/GPT-Engineer-App/content-scribe-genius.git
cd content-scribe-genius
npm i

# This will run a dev server with auto reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

All GPT Engineer projects can be deployed directly via the GPT Engineer app. 

Simply visit your project at [GPT Engineer](https://run.gptengineer.app/projects/65481ab7-e19b-4178-b178-a2c61a6160b7/improve) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain, then we recommend GitHub Pages.

To use GitHub Pages you will need to follow these steps: 
- Deploy your project using GitHub Pages - instructions [here](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#creating-your-site)
- Configure a custom domain for your GitHub Pages site - instructions [here](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)