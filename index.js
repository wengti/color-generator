import convert from 'color-convert'
import { v4 as uuidv4 } from 'uuid'


const colorForm = document.getElementById('color-form')
const colorImgContainerArr = document.querySelectorAll('.color-img-container')
const colorLabelArr = document.querySelectorAll('.color-label')
const inputColor = document.querySelector("input[type='color']")
const switchGrid = document.getElementById('switch-grid')
const colorContainer = document.getElementById('color-container')
const colorLabelContainerArr = Array.from(document.getElementsByClassName('color-label-container'))
const dropDown = document.querySelector('select')
const hexInput = document.getElementById('hex-input')
const rgbInput = document.getElementById('rgb-input')
const hslInput = document.getElementById('hsl-input')
const statusMsg = document.getElementById('status-msg')
const btnArr = Array.from(document.getElementsByClassName('btn'))
const saveBtn = document.getElementById('save-btn')
const hexRadio = document.getElementById('hex')
const saveColorContainer = document.getElementById('save-color-container')

let fetchCompleteFlag = false

let saveColorArr = []

let colorValArr = []



saveBtn.addEventListener('click', handleSaveColor)


const onBgStyle = '#43E08F'
btnArr.forEach( elem => {
    elem.addEventListener('mouseenter', function(event){
        
        handleBtnHint(this, onBgStyle)
    })
})

const offBgStyle = ''
btnArr.forEach( elem => {
    elem.addEventListener('mouseleave', function(event){
        handleBtnHint(this, offBgStyle)
    })
})

function handleBtnHint(elem, bgStyle){
    elem.style.backgroundColor = bgStyle;
    inputColor.style.backgroundColor = bgStyle;
}


inputColor.addEventListener('change', function(){
    handleInputColorChange()
})

document.addEventListener('keypress', function(event){

    if (event.key === 'Enter'){
        event.preventDefault()
        if(event.target.id === 'hex-input'){
            convertHexToOther()
        }
        else if(event.target.id === 'rgb-input'){
            convertRgbToOther()
             
        }
        else if(event.target.id === 'hsl-input'){
            convertHslToOther() 
        }
        const changeFromText = true
        handleInputChange(changeFromText)
    }     
})

colorForm.addEventListener('submit', function(event){
    event.preventDefault()

    const changeFromText = false
    handleInputChange(changeFromText)
})

window.addEventListener('resize', function(event){
    handleWindowSizeChange()
})


document.addEventListener('click', function(event){
    if(event.target.dataset.colorId){
        handleCopyText(event.target.dataset.colorId)
    }
})

document.addEventListener('dblclick', function(event){
    if (event.target.dataset.dblclick){
        handleCopyInputText(event.target)
    }
})


// Check user's prefer mode is dark or not
let darkModeFlag = ''
const isDarkModePreferred = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
if (isDarkModePreferred){
    darkModeFlag = 'checked'
}

// Check current window width and decide appearance changes
handleWindowSizeChange()

// dont change the flag, just change appearance as light / dark
const toggleDarkModeFlag = false
handleDarkModeSwitch(toggleDarkModeFlag) 

// Fetch data from API for a random color
randomFetchAndRender()


async function handleSaveColor(){

    // Make it in hex format -> paletteArr in Hex -> Easier to be displayed
    hexRadio.checked = true

    // Make sure all the colors are updated (important for case when
    // color picker is changed, but never send to fetch the result from API)
    const changeFromText = false
    await handleInputChange(changeFromText) // wait until the fetch is completed

    
    

    // Save the rendered result
    saveColorArr.unshift({
        hex: '#' + getColorFromPicker()[0],
        mode: getColorFromPicker()[1],
        paletteArr: colorValArr,
        id: uuidv4()
    })


    // Allow saving up to 20 results
    if (saveColorArr.length > 20){
        saveColorArr.pop()
    }

    // Show the saved color table
    renderSavedColor()

}

function renderSavedColor(){
    let savedColorHtml = ''

    for (let colorObj of saveColorArr){

        let {hex, mode, paletteArr, id} = colorObj
        mode = mode[0].toUpperCase() + mode.slice(1) // Capitalize the first letter
        savedColorHtml += `
            <div class='save-color-mode'>
                ${mode}
            </div>

            <div style="background-color: ${hex}" data-save-color-id=${id}
                class='base-save-color'>
            </div>

            <button class = 'del-save-btn'>
                DEL
            </button>

            <div style="background-color: ${paletteArr[0]}" data-save-color-id=${id}
                class='color-palette'>
            </div>

            <div style="background-color: ${paletteArr[1]}" data-save-color-id=${id}
                class='color-palette'>
            </div>

            <div style="background-color: ${paletteArr[2]}" data-save-color-id=${id}
                class='color-palette'>
            </div>

            <div style="background-color: ${paletteArr[3]}" data-save-color-id=${id}
                class='color-palette'>
            </div>

            <div style="background-color: ${paletteArr[4]}" data-save-color-id=${id}
                class='color-palette'>
            </div>
        `
    }

    saveColorContainer.innerHTML = savedColorHtml

    console.log(savedColorHtml)
    console.log(saveColorArr)
}


function getNumberFromText(inputText){
    const tempArr = []
    let tempStr = ''
    for (let letter of inputText){

        if (!isNaN(letter)){
            tempStr += letter
        }

        if (letter === ','){
            tempArr.push(Number(tempStr))
            tempStr = ''
        }
    }
    tempArr.push(tempStr)

    return tempArr
}

function convertHexToOther(){
    const rgbArr = convert.hex.rgb(hexInput.value.slice(1))
    rgbInput.value = `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`

    const hslArr = convert.hex.hsl(hexInput.value.slice(1))
    hslInput.value = `hsl(${hslArr[0]}, ${hslArr[1]}%, ${hslArr[2]}%)`
}

function convertRgbToOther(){
    const numArr = getNumberFromText(rgbInput.value)

    const hexStr = convert.rgb.hex(numArr)
    hexInput.value = `#${hexStr}`

    const hslArr = convert.rgb.hsl(numArr)
    hslInput.value = `hsl(${hslArr[0]}, ${hslArr[1]}%, ${hslArr[2]}%)`    
}

function convertHslToOther(){
    const numArr = getNumberFromText(hslInput.value)

    const hexStr = convert.hsl.hex(numArr)
    hexInput.value = `#${hexStr}`

    const rgbArr = convert.hsl.rgb(numArr)
    rgbInput.value = `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`    
}

function handleInputColorChange(){
    hexInput.value = inputColor.value
    convertHexToOther()
}


async function handleInputChange(changeFromText=true){

    if (changeFromText){
        inputColor.value = hexInput.value 
    } else {
        hexInput.value = inputColor.value
        convertHexToOther()
    }

    const colorHex = getColorFromPicker()[0]
    const colorMode = getColorFromPicker()[1]
    const colorFormat = getColorFromPicker()[2]

    return fetchAndRenderColor(colorHex, colorMode, colorFormat)
}



function getColorFromPicker(){
    const colorFormData = new FormData(colorForm)
    const colorHex = colorFormData.get('input-color').slice(1) //#000000
    const colorMode = colorFormData.get('drop-down') //monochrome
    const colorFormat = colorFormData.get('color-format') //hex, rgb, hsl

    return [colorHex, colorMode, colorFormat]
}

function randomFetchAndRender(){
    // Generate a random hex number
    let randColorHex = (Math.floor(Math.random() * 16**6)).toString(16)
    while (randColorHex.length<6){
        randColorHex = '0' + randColorHex
    }
    inputColor.value = '#' + randColorHex // Assign to the color input

    hexInput.value = inputColor.value
    convertHexToOther()
    

    //Generate a random color Mode
    const colorMode = ['monochrome', 'monochrome-dark', 'monochrome-light', 'analogic', 
                        'complement', 'analogic-complement', 'triad', 'quad']
    
    const randColorModeIndex = Math.floor(Math.random() * colorMode.length)
    const randColorMode = colorMode[randColorModeIndex]

    document.querySelector(`option[value='${randColorMode}']`).setAttribute('selected', '')

    fetchAndRenderColor(randColorHex, randColorMode)
    
}


async function fetchAndRenderColor(colorHex, colorMode, colorFormat='hex'){
    const api = `https://www.thecolorapi.com/scheme?hex=${colorHex}&mode=${colorMode}&count=5`
    statusMsg.textContent = 'Getting color...'

    let fetchCompleteFlag = false // Crucial for saving color

    return fetch(api)
        .then(res => res.json())
        .then(data => {
            renderColor(data, colorFormat)
        })
}

function renderColor(data, colorFormat='hex') {

    colorValArr = []

    for (let i=0; i<data.colors.length; i++){
        colorImgContainerArr[i].style.backgroundColor = data.colors[i].hex.value
        
        switch(colorFormat){
            default:
            case 'hex':
                colorLabelArr[i].textContent = data.colors[i].hex.value
                colorValArr.push(data.colors[i].hex.value)
                break
            
            case 'rgb':
                colorLabelArr[i].textContent = data.colors[i].rgb.value
                colorValArr.push(data.colors[i].rgb.value)
                break
            
            case 'hsl':
                colorLabelArr[i].textContent = data.colors[i].hsl.value
                colorValArr.push(data.colors[i].hsl.value)
                break
        }
        
    }

    hexInput.value = inputColor.value
    statusMsg.textContent = 'Hit Enter or Get Color to start!'
}

// Copy //
function handleCopyText(colorId){
    navigator.clipboard.writeText(colorValArr[Number(colorId)-1])
    statusMsg.textContent = 'Color copied!'
}

function handleCopyInputText(elem){
    elem.select()
    navigator.clipboard.writeText(elem.value)
    statusMsg.textContent = 'Color copied!'
}

// Window Size Change //
function handleWindowSizeChange(){
    if (window.innerWidth >= 320){

        let leftBulbType = ''
        let rightBulbType = ''
        if (darkModeFlag) {
            leftBulbType = 'fa-solid'
            rightBulbType = 'fa-regular'
        } else {
            leftBulbType = 'fa-regular'
            rightBulbType = 'fa-solid'
        }

        switchGrid.innerHTML = `
            <i class="${leftBulbType} fa-lightbulb" id='left-bulb'></i>
            <label class="switch" id='switch'>
                <input type="checkbox" ${darkModeFlag}>
                <span class="slider round"></span>
            </label>
            <i class="${rightBulbType} fa-lightbulb" id='right-bulb'></i>
        `
    } else {
        switchGrid.innerHTML = `
            <label class="switch" id='switch'>
                <input type="checkbox" ${darkModeFlag}>
                <span class="slider round"></span>
            </label>
        `
    }

    // Add here to prevent the event listener after window resize
    // Also enter it to change the dark mode if necessary
    document.querySelector("input[type='checkbox']").addEventListener('change', handleDarkModeSwitch)
}

// Handle Dark Mode //
function handleDarkModeSwitch(toggle=true) {

    const leftBulb = document.getElementById('left-bulb')
    const rightBulb = document.getElementById('right-bulb')

    if (toggle && darkModeFlag){
        darkModeFlag = ''
    } else if (toggle && !darkModeFlag){
        darkModeFlag = 'checked'
    }
    
    if(darkModeFlag){
        document.body.classList.add('dark-body')

        document.querySelectorAll('input').forEach( elem => {
            elem.classList.add('dark-form')
        })

        btnArr.forEach(elem=>{
            elem.classList.add('dark-selectable')
        })

        dropDown.classList.add('dark-selectable')
    
        Array.from(document.getElementsByClassName('reference-link')).forEach(elem => {
            elem.classList.add('dark-text')
        })

        
        
        colorContainer.classList.add('dark-color-container')
        colorLabelContainerArr.forEach( 
            elem => elem.classList.add('dark-color-label-container'))
        
        if (leftBulb && rightBulb){
            leftBulb.classList.add('fa-solid')
            leftBulb.classList.remove('fa-regular')
            rightBulb.classList.add('fa-regular')
            rightBulb.classList.remove('fa-solid')
        }
    } else {
        document.body.classList.remove('dark-body')
        
        document.querySelectorAll('input').forEach( elem => {
            elem.classList.remove('dark-form')
        })

        btnArr.forEach(elem=>{
            elem.classList.remove('dark-selectable')
        })
        dropDown.classList.remove('dark-selectable')

        Array.from(document.getElementsByClassName('reference-link')).forEach(elem => {
            elem.classList.remove('dark-text')
        })

            
        colorContainer.classList.remove('dark-color-container')
        colorLabelContainerArr.forEach( 
            elem => elem.classList.remove('dark-color-label-container'))
        
        if (leftBulb && rightBulb){
            leftBulb.classList.remove('fa-solid')
            leftBulb.classList.add('fa-regular')
            rightBulb.classList.remove('fa-regular')
            rightBulb.classList.add('fa-solid')
        }
    }
}